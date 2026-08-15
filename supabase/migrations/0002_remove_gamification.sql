-- 0002_remove_gamification.sql
-- De-gamification: drop the synthetic point values the app no longer uses.
-- Placements (Gold/Silver/Bronze/etc.) stay — they are real result data, and
-- the Analytics "Top Players" view derives everything from placements,
-- attendance and participation.
--
-- Applies to live databases created before the de-gamification; fresh
-- installs get this state straight from 0001_initial_schema.sql.

ALTER TABLE achievements DROP COLUMN IF EXISTS points;
ALTER TABLE club_settings DROP COLUMN IF EXISTS weight_attendance;