-- ============================================================================
-- 0010: former members — students who left the club
-- ----------------------------------------------------------------------------
-- left_at marks a student as a former member: attendance marking stops (the
-- UI hides them), parents are unlinked, but their attendance/achievement
-- history stays for school-performance analysis. NULL = active member.
-- ============================================================================

ALTER TABLE students ADD COLUMN IF NOT EXISTS left_at timestamptz;