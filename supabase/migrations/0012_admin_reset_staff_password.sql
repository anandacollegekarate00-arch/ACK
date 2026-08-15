-- Admin function to reset staff user passwords (coaches, captains, senior players)
-- Only callable by coaches/captains
-- Always uses "000000" as temporary password

CREATE OR REPLACE FUNCTION admin_reset_staff_password(
  target_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_role TEXT;
  temp_password TEXT := '000000';
BEGIN
  -- Only coaches and captains can call this
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can reset passwords';
  END IF;

  -- Check target user is staff (coach, captain, or senior_player)
  SELECT role INTO target_role FROM profiles WHERE id = target_user_id;
  
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  IF target_role NOT IN ('coach', 'captain', 'senior_player') THEN
    RAISE EXCEPTION 'Can only reset passwords for staff accounts (coaches, captains, senior players)';
  END IF;

  -- Update the password to "000000" and flag that it must be changed on next sign-in
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(temp_password, extensions.gen_salt('bf')),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) ||
        jsonb_build_object('must_change_password', true),
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN temp_password;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_reset_staff_password(UUID) TO authenticated;

COMMENT ON FUNCTION admin_reset_staff_password IS 'Reset password for staff users (coaches, captains, senior players) to temporary password "000000". Only coaches/captains can call this.';
