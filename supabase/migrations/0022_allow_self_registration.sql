-- ============================================================================
-- 0022 — ALLOW SELF-SERVICE REGISTRATION
-- Enable users to create their own profile row after signing up via
-- supabase.auth.signUp(). New users always get role='parent' and must be
-- linked to students by a coach later.
-- ============================================================================

-- Allow authenticated users to insert their own profile row on first sign-in.
-- The WITH CHECK ensures they can only create a row for their own auth.uid().
-- Role is hardcoded to 'parent' in the client logic (never user-supplied).
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can create their own profile" ON profiles IS 
  'Allows self-service registration. Users can insert a profiles row for their own auth UID after signing up. Role must be set by client logic (always parent for new signups).';
