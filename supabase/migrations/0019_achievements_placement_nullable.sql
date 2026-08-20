-- BUG-05: The achievements.placement column was NOT NULL which rejected every
-- AddAchievementModal insert (placement was not included in the payload).
-- ResultEntryModal already saves NULL for "no result yet", so the NOT NULL
-- constraint was overly strict. Drop it to allow optional placement values.
ALTER TABLE achievements ALTER COLUMN placement DROP NOT NULL;
