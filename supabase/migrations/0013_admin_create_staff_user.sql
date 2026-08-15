-- Admin function to create staff users (coaches, captains, senior players)
-- Handles auth user creation, profile creation, and permissions setup
-- Always uses "000000" as temporary password

CREATE OR REPLACE FUNCTION admin_create_staff_user(
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  user_permissions JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  temp_password TEXT := '000000';
BEGIN
  -- Only coaches and captains can create staff accounts
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can create staff accounts';
  END IF;

  -- Validate role
  IF user_role NOT IN ('coach', 'captain', 'senior_player') THEN
    RAISE EXCEPTION 'Invalid role. Must be coach, captain, or senior_player';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'An account with this email already exists';
  END IF;

  -- Create auth user using Supabase admin function or manual insert
  IF to_regprocedure('supabase_admin_create_user(jsonb)') IS NOT NULL THEN
    SELECT supabase_admin_create_user(jsonb_build_object(
      'email', user_email,
      'password', temp_password,
      'email_confirm', true,
      'user_metadata', jsonb_build_object(
        'role', user_role,
        'name', user_name,
        'must_change_password', true
      )
    )) INTO new_user_id;
  ELSE
    -- Manual insert for older Supabase projects
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
      user_email,
      extensions.crypt(temp_password, extensions.gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', user_role, 'name', user_name, 'must_change_password', true),
      NOW(), NOW(), '', '', '', ''
    )
    RETURNING id INTO new_user_id;

    -- Required identity row for email provider sign-in
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      user_email,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', user_email, 'email_verified', true),
      'email',
      NOW(), NOW(), NOW()
    );
  END IF;

  -- Force-create/update the profile with correct role
  -- Use INSERT ... ON CONFLICT to ensure the profile has the right role
  INSERT INTO profiles (id, role, name)
  VALUES (new_user_id, user_role, user_name)
  ON CONFLICT (id) DO UPDATE 
  SET role = EXCLUDED.role, 
      name = EXCLUDED.name,
      updated_at = NOW();

  -- If senior player, create permissions record
  IF user_role = 'senior_player' THEN
    INSERT INTO user_permissions (
      user_id,
      can_mark_attendance,
      can_manage_students,
      can_add_achievements,
      can_register_tournaments,
      can_promote_belts
    ) VALUES (
      new_user_id,
      COALESCE((user_permissions->>'can_mark_attendance')::boolean, false),
      COALESCE((user_permissions->>'can_manage_students')::boolean, false),
      COALESCE((user_permissions->>'can_add_achievements')::boolean, false),
      COALESCE((user_permissions->>'can_register_tournaments')::boolean, false),
      COALESCE((user_permissions->>'can_promote_belts')::boolean, false)
    );
  END IF;

  -- Return success with user ID and temp password
  RETURN jsonb_build_object(
    'user_id', new_user_id,
    'email', user_email,
    'temporary_password', temp_password,
    'role', user_role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_create_staff_user(TEXT, TEXT, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION admin_create_staff_user IS 'Create staff user accounts (coaches, captains, senior players) with temporary password "000000". Only coaches/captains can call this.';
