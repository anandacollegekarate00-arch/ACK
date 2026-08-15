-- ============================================================================
-- 0006 — DROP LEGACY RLS POLICIES / FUNCTIONS
-- The live database predates the managed schema: it still carries the old
-- app's duplicate policies ("coaches full access", "everyone reads",
-- "parents view own child", "coaches manage"). The "parents view own child"
-- trio called my_student_id(), which read profiles.student_id — dropped in
-- 0005 — so those policies error on every parent query (42703).
--
-- The modern 0001 policy set (is_staff / is_parent_of helpers) covers every
-- one of these cases, so the legacy set is removed wholesale, including the
-- "everyone reads registrations" policy that leaked every student's
-- registration rows to any authenticated user.
-- ============================================================================

DROP POLICY IF EXISTS "parents view own child" ON students;
DROP POLICY IF EXISTS "coaches full access students" ON students;

DROP POLICY IF EXISTS "parents view own child attendance" ON attendance;
DROP POLICY IF EXISTS "coaches full access attendance" ON attendance;

DROP POLICY IF EXISTS "parents view own child achievements" ON achievements;
DROP POLICY IF EXISTS "coaches full access achievements" ON achievements;

DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
DROP POLICY IF EXISTS "coaches manage profiles" ON profiles;
DROP POLICY IF EXISTS "coaches see all profiles" ON profiles;
DROP POLICY IF EXISTS "coaches update profiles" ON profiles;
DROP POLICY IF EXISTS "own profile" ON profiles;
DROP POLICY IF EXISTS "users update own profile" ON profiles;

DROP POLICY IF EXISTS "coaches manage sessions" ON sessions;
DROP POLICY IF EXISTS "everyone reads sessions" ON sessions;

DROP POLICY IF EXISTS "coaches manage series" ON tournament_series;
DROP POLICY IF EXISTS "everyone reads series" ON tournament_series;

DROP POLICY IF EXISTS "coaches manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "everyone reads tournaments" ON tournaments;

DROP POLICY IF EXISTS "coaches manage events" ON tournament_events;
DROP POLICY IF EXISTS "everyone reads events" ON tournament_events;

DROP POLICY IF EXISTS "coaches manage registrations" ON event_registrations;
DROP POLICY IF EXISTS "everyone reads registrations" ON event_registrations;

DROP POLICY IF EXISTS "coaches manage settings" ON club_settings;
DROP POLICY IF EXISTS "everyone reads settings" ON club_settings;

-- Legacy helpers, now unused by any surviving policy
DROP FUNCTION IF EXISTS my_student_id();
DROP FUNCTION IF EXISTS is_coach();