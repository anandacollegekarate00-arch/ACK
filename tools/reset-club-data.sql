-- ============================================================================
-- RESET CLUB DATA — DESTRUCTIVE. Wipes all club data so the app starts
-- brand new. Kept OUTSIDE supabase/migrations/ on purpose: it must never
-- run automatically. Run via:
--   node tools/run-migrations.mjs tools/reset-club-data.sql
--
-- NOTE: TRUNCATE ... CASCADE removes ALL rows of any table that has a
-- foreign key to a truncated table (it does NOT respect WHERE clauses).
-- profiles.student_id references students, so the whole profiles table
-- would be wiped — including the coach login. The coach profile is saved
-- to a temp table first and re-inserted afterwards.
-- ============================================================================

-- Preserve coach login (temp table lives for this one connection/transaction)
CREATE TEMP TABLE _coach_profiles ON COMMIT DROP AS
  SELECT * FROM profiles WHERE role = 'coach';

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

-- Restore the coach login
INSERT INTO profiles SELECT * FROM _coach_profiles;