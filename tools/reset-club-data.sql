-- ============================================================================
-- RESET CLUB DATA — DESTRUCTIVE. Wipes all club data so the app starts
-- brand new. Kept OUTSIDE supabase/migrations/ on purpose: it must never
-- run automatically. Run via:
--   node tools/run-migrations.mjs tools/reset-club-data.sql
--
-- NOTE: TRUNCATE ... CASCADE removes ALL rows of any table that has a
-- foreign key to a truncated table (it does NOT respect WHERE clauses).
-- profiles.student_id references students, so the whole profiles table
-- would be wiped — including staff logins. Staff profiles (coach/captain/
-- admin) are saved to a temp table first and re-inserted afterwards, so
-- the staff can still log in. Parent accounts are wiped entirely.
-- ============================================================================

-- Preserve staff logins (temp table lives for this one connection/transaction)
CREATE TEMP TABLE _staff_profiles ON COMMIT DROP AS
  SELECT * FROM profiles WHERE role IN ('coach', 'captain', 'admin');

-- Wipe all club data (profiles included, see note above). admission_counters
-- is cleared too, so the next student inserted gets ACK-<year>-001 again.
TRUNCATE TABLE
  students,
  attendance,
  achievements,
  tournament_series,
  tournaments,
  tournament_events,
  event_registrations,
  sessions,
  admission_counters,
  profiles
RESTART IDENTITY CASCADE;

-- Restore staff logins
INSERT INTO profiles SELECT * FROM _staff_profiles;