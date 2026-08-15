-- ============================================================================
-- 0007 — FIX PGCrypto REFERENCES IN PARENT-ACCOUNT FUNCTIONS
-- pgcrypto lives in the `extensions` schema, but both parent-account
-- functions SET search_path = public, so the unqualified gen_salt/crypt
-- calls failed at runtime:
--   "function gen_salt(unknown) does not exist"
-- (admin_create_parent_login always took the fallback branch here because
-- supabase_admin_create_user is not installed, and admin_reset_parent_password
-- always calls crypt.) Qualify both with the extensions schema.
-- ============================================================================

-- --- admin_create_parent_login --------------------------------------------
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

  -- Link this parent to the student
  INSERT INTO parent_students (parent_id, student_id)
  VALUES (new_user_id, admin_create_parent_login.student_id);

  RETURN generated_password;
END;
$$;

-- --- admin_reset_parent_password ------------------------------------------
CREATE OR REPLACE FUNCTION admin_reset_parent_password(
  target_user_id UUID,
  new_password TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_password TEXT;
BEGIN
  -- Only staff (coaches/captains) can call this
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can reset passwords';
  END IF;

  -- Only allow resetting parent accounts
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = target_user_id AND role = 'parent'
  ) THEN
    RAISE EXCEPTION 'Can only reset passwords for parent accounts';
  END IF;

  generated_password := COALESCE(NULLIF(TRIM(new_password), ''), substr(md5(gen_random_uuid()::text), 1, 8));

  -- Update the password and flag that it must be changed on next sign-in
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(generated_password, extensions.gen_salt('bf')),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) ||
        jsonb_build_object('must_change_password', true),
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN generated_password;
END;
$$;