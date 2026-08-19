-- Migration: Club History
-- Per-year club leadership and highlights (achievements, donations, other).

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS club_history (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INTEGER     NOT NULL UNIQUE,
  captain     TEXT,
  vice_captain TEXT,
  coach       TEXT,
  assistant_coaches TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club_history_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  history_id  UUID        NOT NULL REFERENCES club_history(id) ON DELETE CASCADE,
  section     TEXT        NOT NULL CHECK (section IN ('achievement', 'other')),
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_club_history_year            ON club_history(year DESC);
CREATE INDEX IF NOT EXISTS idx_club_history_entries_history ON club_history_entries(history_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE club_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history_entries ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read history
CREATE POLICY "Authenticated users can view club history"
  ON club_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view club history entries"
  ON club_history_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only staff (coach / captain) can write
CREATE POLICY "Staff can manage club history"
  ON club_history FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Staff can manage club history entries"
  ON club_history_entries FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());
