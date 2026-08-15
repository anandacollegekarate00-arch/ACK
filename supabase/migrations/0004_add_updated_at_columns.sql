-- 0004_add_updated_at_columns.sql
-- The live database was created before the updated_at triggers existed, so
-- tables lack the column while the BEFORE UPDATE triggers from 0001 require
-- it — every UPDATE fails with 42703 ("record new has no field updated_at").
-- Add the columns (idempotent); existing rows get NOW() as their baseline.

ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE club_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();