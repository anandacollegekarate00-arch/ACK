-- Drop the stale `points` column that was added outside the migration system.
-- It carries a NOT NULL constraint with no default, causing every INSERT to fail.
-- Uses IF EXISTS so this is idempotent — safe on fresh installs that never had the column.
ALTER TABLE tournaments DROP COLUMN IF EXISTS points;
