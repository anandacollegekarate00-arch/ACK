-- 0003_seed_admission_counters.sql
-- The admission-ID trigger assigns ACK-YYYY-NNN from a per-year counter.
-- Databases created before the trigger (the live one) already contain
-- students with client-side IDs (ACK-2026-001, ...) but an EMPTY counter,
-- so the next insert regenerates 001 and hits students_admission_id_key
-- (23505). Seed the counter to the max suffix already used per year.
-- Idempotent: re-running only ever raises the counter.

-- By join_date year (what assign_admission_id() actually uses)
INSERT INTO admission_counters (year, last_value)
SELECT EXTRACT(YEAR FROM s.join_date)::INTEGER AS year,
       MAX(SUBSTRING(s.admission_id FROM '^ACK-[0-9]{4}-([0-9]+)$')::INTEGER) AS last_value
FROM students s
WHERE s.admission_id ~ '^ACK-[0-9]{4}-[0-9]+$'
  AND s.join_date IS NOT NULL
GROUP BY 1
ON CONFLICT (year) DO UPDATE
  SET last_value = GREATEST(admission_counters.last_value, EXCLUDED.last_value);

-- Safety: also cover the year encoded in the ID itself, so no used suffix
-- ever gets regenerated even if join_date and ID years disagree.
INSERT INTO admission_counters (year, last_value)
SELECT SUBSTRING(s.admission_id FROM '^ACK-([0-9]{4})-')::INTEGER AS year,
       MAX(SUBSTRING(s.admission_id FROM '^ACK-[0-9]{4}-([0-9]+)$')::INTEGER) AS last_value
FROM students s
WHERE s.admission_id ~ '^ACK-[0-9]{4}-[0-9]+$'
GROUP BY 1
ON CONFLICT (year) DO UPDATE
  SET last_value = GREATEST(admission_counters.last_value, EXCLUDED.last_value);