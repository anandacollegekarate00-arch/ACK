-- Migration: Rename sessions.title to sessions.name
-- The app was updated to use the column name 'name' to match the DB,
-- but the DB column was originally created as 'title'.
-- This aligns them permanently.

ALTER TABLE sessions RENAME COLUMN title TO name;
