-- ============================================================================
-- 0008 — LINK SEVERAL STUDENTS TO ONE PARENT ACCOUNT
-- admin_create_parent_login previously took a single student_id, so a parent
-- created by phone could only be linked to one child. The signature changes
-- to student_ids UUID[] (drop first: parameter type changed, CREATE OR
-- REPLACE cannot alter it). The parent_students table already allows a
-- parent to hold many links — this just exposes it at creation time.
-- ============================================================================

DROP FUNCTION IF EXISTS admin_create_parent_login(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION admin_create_parent_login(
  student_ids UUID[],
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
  n_links INTEGER;
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

  -- At least one child must be linked
  IF student_ids IS NULL OR cardinality(student_ids) = 0 THEN
    RAISE EXCEPTION 'Select at least one student to link';
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
      extensions.crypt(generated_password, extensions.gen_salt('bf')),
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

  -- Link this parent to every selected student (dedupe defensively)
  INSERT INTO parent_students (parent_id, student_id)
  SELECT DISTINCT new_user_id, unnest(student_ids)
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*) INTO n_links FROM parent_students WHERE parent_id = new_user_id;
  IF n_links = 0 THEN
    RAISE EXCEPTION 'None of the selected students could be linked';
  END IF;

  RETURN generated_password;
END;
$$;