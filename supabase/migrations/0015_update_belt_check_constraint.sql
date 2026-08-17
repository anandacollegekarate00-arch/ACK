-- Migration: update students_belt_check constraint to allow the new belt names.
-- The old constraint was added outside the migration system and only allowed
-- the legacy belt values. Drop it and replace with the current belt list.

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_belt_check;

ALTER TABLE students ADD CONSTRAINT students_belt_check CHECK (belt IN (
  'White (10th Kyu)',
  'Yellow (9th Kyu)',
  'Orange (8th Kyu)',
  'Green (7th Kyu)',
  'Purple (6th Kyu)',
  'Blue 1 (5th Kyu)',
  'Blue 2 (4th Kyu)',
  'Brown 1 (3rd Kyu)',
  'Brown 2 (2nd Kyu)',
  'Brown 3 (1st Kyu)',
  'Black'
));
