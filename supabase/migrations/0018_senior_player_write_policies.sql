-- BUG-02: Update tournament table policies so senior_player users whose
-- can_register_tournaments() returns true can INSERT/UPDATE/DELETE.
-- Sessions, club_history, and club_settings stay admin-only (is_staff()).

DROP POLICY IF EXISTS "Staff can manage tournaments" ON tournaments;
CREATE POLICY "Staff can manage tournaments"
  ON tournaments FOR ALL
  USING  (can_register_tournaments())
  WITH CHECK (can_register_tournaments());

DROP POLICY IF EXISTS "Staff can manage tournament series" ON tournament_series;
CREATE POLICY "Staff can manage tournament series"
  ON tournament_series FOR ALL
  USING  (can_register_tournaments())
  WITH CHECK (can_register_tournaments());

DROP POLICY IF EXISTS "Staff can manage tournament events" ON tournament_events;
CREATE POLICY "Staff can manage tournament events"
  ON tournament_events FOR ALL
  USING  (can_register_tournaments())
  WITH CHECK (can_register_tournaments());
