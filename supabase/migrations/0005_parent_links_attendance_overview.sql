-- ============================================================================
-- 0005 — MULTI-CHILD PARENT LINKS + CLUB ATTENDANCE OVERVIEW
-- Parents move from a single profiles.student_id to a many-to-many link
-- table: one login can cover several children, and a child can have both
-- parents linked. Also adds an aggregate-only overview RPC so parents can
-- see club-wide attendance numbers WITHOUT seeing any individual student's
-- records.
-- ============================================================================

-- --- parent_students link table -------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_students (
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (parent_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage parent links" ON public.parent_students;
CREATE POLICY "Staff can manage parent links"
  ON public.parent_students FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Parents can view their own links" ON public.parent_students;
CREATE POLICY "Parents can view their own links"
  ON public.parent_students FOR SELECT
  USING (parent_id = auth.uid());

-- Migrate existing single-child links, then drop the old column so
-- profiles.student_id can never drift out of sync with the link table.
-- (Guarded: after the first run the column no longer exists.)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'student_id'
  ) THEN
    INSERT INTO public.parent_students (parent_id, student_id)
    SELECT id, student_id FROM public.profiles
    WHERE role = 'parent' AND student_id IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS student_id;

-- --- is_parent_of resolves through the link table --------------------------
-- (every existing parent RLS policy keeps working unchanged — they all call
-- this helper.)
CREATE OR REPLACE FUNCTION is_parent_of(student_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_students
    WHERE parent_students.parent_id = auth.uid()
      AND parent_students.student_id = student_id_to_check
  );
$$;

-- --- admin_create_parent_login: create the link, not the column -----------
-- Signature and return type are unchanged, so CREATE OR REPLACE is enough.
CREATE OR REPLACE FUNCTION admin_create_parent_login(
  student_id UUID,
  login_phone TEXT,
  parent_name TEXT,
  new_password TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  synthetic_email TEXT;
  new_user_id UUID;
  generated_password TEXT;
BEGIN
  -- Only staff (coaches/captains) can call this
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can create parent accounts';
  END IF;

  -- Clean phone number (remove non-digits)
  login_phone := regexp_replace(login_phone, '[^0-9]', '', 'g');
  IF login_phone = '' THEN
    RAISE EXCEPTION 'A valid phone number is required';
  END IF;

  -- Create synthetic email
  synthetic_email := login_phone || '@parent.anandakarateclub.local';

  -- Check if email already exists
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = synthetic_email
  ) THEN
    RAISE EXCEPTION 'An account with this phone number already exists';
  END IF;

  -- Random 8-char alphanumeric password. NEVER a fixed default — a fixed
  -- default ("000000") is guessable by anyone who knows the phone number.
  generated_password := COALESCE(NULLIF(TRIM(new_password), ''), substr(md5(gen_random_uuid()::text), 1, 8));

  -- Prefer the supported Supabase admin helper when present; fall back to a
  -- manual insert (including the auth.identities row newer GoTrue versions
  -- require for email sign-in) on older projects.
  IF to_regprocedure('supabase_admin_create_user(jsonb)') IS NOT NULL THEN
    SELECT supabase_admin_create_user(jsonb_build_object(
      'email', synthetic_email,
      'password', generated_password,
      'email_confirm', true,
      'user_metadata', jsonb_build_object('role', 'parent', 'name', parent_name, 'must_change_password', true)
    )) INTO new_user_id;
  ELSE
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      synthetic_email,
      crypt(generated_password, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'parent', 'name', parent_name, 'must_change_password', true),
      NOW(), NOW(), '', '', '', ''
    )
    RETURNING id INTO new_user_id;

    -- Required identity row for email provider sign-in (GoTrue >= 2.5)
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      synthetic_email,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', synthetic_email, 'email_verified', true),
      'email',
      NOW(), NOW(), NOW()
    );
  END IF;

  -- Create the profile. The project's on_auth_user_created trigger already
  -- inserted it from the auth metadata above (role/name) — this keeps it
  -- correct no matter what the trigger did.
  INSERT INTO profiles (id, role, name)
  VALUES (new_user_id, 'parent', parent_name)
  ON CONFLICT (id) DO UPDATE SET role = 'parent', name = EXCLUDED.name;

  -- Link this parent to the student
  INSERT INTO parent_students (parent_id, student_id)
  VALUES (new_user_id, admin_create_parent_login.student_id);

  RETURN generated_password;
END;
$$;

-- --- Club attendance overview (aggregates only) ----------------------------
-- SECURITY DEFINER so it can see every row, but it returns ONLY club-wide
-- totals — no student names, IDs, or per-student numbers. The rate keeps the
-- app-wide "late counts as half credit" convention, rounded to 1 decimal.
CREATE OR REPLACE FUNCTION get_attendance_overview()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'present') AS present,
      COUNT(*) FILTER (WHERE status = 'absent') AS absent,
      COUNT(*) FILTER (WHERE status = 'late') AS late,
      COUNT(DISTINCT student_id) AS students
    FROM attendance
  ),
  months AS (
    SELECT
      to_char(date, 'YYYY-MM') AS month,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'present') AS present,
      COUNT(*) FILTER (WHERE status = 'absent') AS absent,
      COUNT(*) FILTER (WHERE status = 'late') AS late
    FROM attendance
    GROUP BY to_char(date, 'YYYY-MM')
    ORDER BY to_char(date, 'YYYY-MM') DESC
    LIMIT 6
  ),
  today AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'present') AS present,
      COUNT(*) FILTER (WHERE status = 'absent') AS absent,
      COUNT(*) FILTER (WHERE status = 'late') AS late
    FROM attendance
    WHERE date = CURRENT_DATE
  )
  SELECT jsonb_build_object(
    'students', (SELECT students FROM agg),
    'total', (SELECT total FROM agg),
    'present', (SELECT present FROM agg),
    'absent', (SELECT absent FROM agg),
    'late', (SELECT late FROM agg),
    'rate', CASE WHEN (SELECT total FROM agg) > 0
      THEN round(((SELECT present FROM agg) + (SELECT late FROM agg) * 0.5) * 1000.0 / (SELECT total FROM agg)) / 10
      ELSE 0 END,
    'today', (SELECT to_jsonb(today) FROM today),
    'months', (SELECT coalesce(jsonb_agg(
        jsonb_build_object(
          'month', month,
          'label', to_char(to_date(month || '-01', 'YYYY-MM-DD'), 'Mon'),
          'total', total,
          'present', present,
          'absent', absent,
          'late', late,
          'rate', CASE WHEN total > 0 THEN round((present + late * 0.5) * 1000.0 / total) / 10 ELSE 0 END
        ) ORDER BY month DESC), '[]'::jsonb) FROM months)
  );
$$;

GRANT EXECUTE ON FUNCTION get_attendance_overview() TO authenticated;