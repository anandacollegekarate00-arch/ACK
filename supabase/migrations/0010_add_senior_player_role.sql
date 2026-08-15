-- Add 'senior_player' to the profiles role check constraint
-- This migration allows staff accounts with senior_player role to be created

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with senior_player included
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('coach', 'captain', 'parent', 'senior_player'));

-- Add comment explaining the roles
COMMENT ON COLUMN profiles.role IS 'User role: coach (full access), captain (full access), senior_player (configurable permissions), parent (view only with linked students)';
