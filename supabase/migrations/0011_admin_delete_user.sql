-- Admin function to delete a user completely (auth + profile + permissions)
-- Only callable by coaches/captains

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Only coaches and captains can delete users
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  
  IF caller_role NOT IN ('coach', 'captain') THEN
    RAISE EXCEPTION 'Only coaches and captains can delete users';
  END IF;

  -- Delete from user_permissions first (if exists)
  DELETE FROM user_permissions WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Delete from auth.users (this is the critical part)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users (RLS inside function checks role)
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;

COMMENT ON FUNCTION admin_delete_user IS 'Completely removes a user account including auth, profile, and permissions. Only coaches/captains can call this.';
