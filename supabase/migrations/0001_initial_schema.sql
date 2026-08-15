-- 0001_initial_schema.sql
-- Ananda College Karate Club — full schema (tables, RLS, triggers, helpers).
-- Idempotent: safe to run against a fresh project; mirrors database-schema.sql.
-- Apply order matters: this file must run before 0002_remove_gamification.sql.

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with role and student linkage
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('coach', 'captain', 'parent')),
  name TEXT,
  student_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
-- Core student roster
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  dob DATE NOT NULL,
  birth_cert_no TEXT,
  nic TEXT,
  grade TEXT,
  belt TEXT NOT NULL DEFAULT 'White (10th Kyu)',
  join_date DATE NOT NULL,
  school_admission_no TEXT,
  association_admission_no TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_whatsapp TEXT,
  guardian_email TEXT,
  guardian_address TEXT,
  deleted_at TIMESTAMPTZ, -- soft delete: set instead of removing the row
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESSIONS TABLE
-- Training session schedule (recurring weekly)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  days INTEGER[] NOT NULL, -- Array of day numbers (0=Sunday, 6=Saturday)
  time TEXT NOT NULL, -- Format: "HH:MM" (24-hour)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ATTENDANCE TABLE
-- Daily attendance records
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date, session_id)
);

-- Postgres treats NULL as distinct in UNIQUE constraints, so the constraint
-- above does NOT stop duplicate "general" (session_id IS NULL) marks. This
-- partial index closes that hole — the one gap the app-level check can't.
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_general_unique
  ON attendance (student_id, date)
  WHERE session_id IS NULL;

-- 5. TOURNAMENT SERIES TABLE
-- Recurring tournament series (e.g., "Senior School Championship")
CREATE TABLE IF NOT EXISTS tournament_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TOURNAMENTS TABLE
-- Individual tournament instances
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES tournament_series(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  date DATE,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TOURNAMENT EVENTS TABLE
-- Events within a tournament (e.g., "Kata Individual")
CREATE TABLE IF NOT EXISTS tournament_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- 'individual' or 'team'
  dates DATE[], -- Optional: specific dates if different from tournament date
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EVENT REGISTRATIONS TABLE
-- Student registrations for tournament events
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES tournament_events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  registered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- 9. ACHIEVEMENTS TABLE
-- Competition results and awards (placements only — no synthetic point
-- values; "top players" analysis is derived from placements, attendance
-- and participation)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  event_id UUID REFERENCES tournament_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('School', 'Zonal', 'Provincial', 'National', 'International')),
  placement TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CLUB SETTINGS TABLE
-- Global club configuration (single row)
CREATE TABLE IF NOT EXISTS club_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize club settings with default values
INSERT INTO club_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_students_admission_id ON students(admission_id);
CREATE INDEX IF NOT EXISTS idx_students_belt ON students(belt);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_tournament_id ON achievements(tournament_id);
CREATE INDEX IF NOT EXISTS idx_achievements_date ON achievements(date);

CREATE INDEX IF NOT EXISTS idx_tournaments_series_id ON tournaments(series_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);

CREATE INDEX IF NOT EXISTS idx_tournament_events_tournament_id ON tournament_events(tournament_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================
-- Policies must never SELECT from the very table they protect (Postgres
-- rejects that as infinite recursion, and it's slow). These SECURITY DEFINER
-- helpers run as the table owner (bypassing RLS) so policies stay flat:
--   is_staff()             → coach OR captain
--   is_parent_of(sid)      → parent linked to that student
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('coach', 'captain')
  );
$$;

CREATE OR REPLACE FUNCTION is_parent_of(student_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'parent'
      AND profiles.student_id = student_id_to_check
  );
$$;

GRANT EXECUTE ON FUNCTION is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION is_parent_of(UUID) TO authenticated;

-- ============================================================================
-- SERVER-GENERATED ADMISSION IDS
-- ============================================================================
-- Admission IDs are assigned atomically via a per-year counter — no client-
-- side races possible (the old client-side "ACK-2026-001" could collide).
CREATE TABLE IF NOT EXISTS admission_counters (
  year INTEGER PRIMARY KEY,
  last_value INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE admission_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage admission counters"
  ON admission_counters FOR ALL
  USING (is_staff());

CREATE OR REPLACE FUNCTION assign_admission_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  y INTEGER;
  n INTEGER;
BEGIN
  IF NEW.admission_id IS NOT NULL AND NEW.admission_id <> '' THEN
    RETURN NEW;
  END IF;
  y := EXTRACT(YEAR FROM NEW.join_date)::INTEGER;
  INSERT INTO admission_counters (year, last_value) VALUES (y, 1)
    ON CONFLICT (year) DO UPDATE SET last_value = admission_counters.last_value + 1
    RETURNING last_value INTO n;
  NEW.admission_id := 'ACK-' || y::TEXT || '-' || LPAD(n::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_assign_admission_id ON students;
CREATE TRIGGER students_assign_admission_id
  BEFORE INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION assign_admission_id();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff() OR id = auth.uid());

CREATE POLICY "Staff can update all profiles"
  ON profiles FOR UPDATE
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- STUDENTS POLICIES
DROP POLICY IF EXISTS "Coaches can manage all students" ON students;
DROP POLICY IF EXISTS "Parents can view their linked student" ON students;

CREATE POLICY "Staff can manage all students"
  ON students FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Parents can view their linked student"
  ON students FOR SELECT
  USING (is_parent_of(id));

-- SESSIONS POLICIES
DROP POLICY IF EXISTS "Coaches can manage sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone authenticated can view sessions" ON sessions;

CREATE POLICY "Staff can manage sessions"
  ON sessions FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Anyone authenticated can view sessions"
  ON sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ATTENDANCE POLICIES
DROP POLICY IF EXISTS "Coaches can manage all attendance" ON attendance;
DROP POLICY IF EXISTS "Parents can view their student's attendance" ON attendance;

CREATE POLICY "Staff can manage all attendance"
  ON attendance FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Parents can view their student's attendance"
  ON attendance FOR SELECT
  USING (is_parent_of(student_id));

-- TOURNAMENT SERIES POLICIES
DROP POLICY IF EXISTS "Coaches can manage tournament series" ON tournament_series;
DROP POLICY IF EXISTS "Anyone authenticated can view tournament series" ON tournament_series;

CREATE POLICY "Staff can manage tournament series"
  ON tournament_series FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Anyone authenticated can view tournament series"
  ON tournament_series FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- TOURNAMENTS POLICIES
DROP POLICY IF EXISTS "Coaches can manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "Anyone authenticated can view tournaments" ON tournaments;

CREATE POLICY "Staff can manage tournaments"
  ON tournaments FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Anyone authenticated can view tournaments"
  ON tournaments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- TOURNAMENT EVENTS POLICIES
DROP POLICY IF EXISTS "Coaches can manage tournament events" ON tournament_events;
DROP POLICY IF EXISTS "Anyone authenticated can view tournament events" ON tournament_events;

CREATE POLICY "Staff can manage tournament events"
  ON tournament_events FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Anyone authenticated can view tournament events"
  ON tournament_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- EVENT REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "Coaches can manage event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Parents can view their student's registrations" ON event_registrations;

CREATE POLICY "Staff can manage event registrations"
  ON event_registrations FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Parents can view their student's registrations"
  ON event_registrations FOR SELECT
  USING (is_parent_of(student_id));

-- ACHIEVEMENTS POLICIES
DROP POLICY IF EXISTS "Coaches can manage all achievements" ON achievements;
DROP POLICY IF EXISTS "Parents can view their student's achievements" ON achievements;

CREATE POLICY "Staff can manage all achievements"
  ON achievements FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Parents can view their student's achievements"
  ON achievements FOR SELECT
  USING (is_parent_of(student_id));

-- CLUB SETTINGS POLICIES
DROP POLICY IF EXISTS "Coaches can manage club settings" ON club_settings;
DROP POLICY IF EXISTS "Anyone authenticated can view club settings" ON club_settings;

CREATE POLICY "Staff can manage club settings"
  ON club_settings FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Anyone authenticated can view club settings"
  ON club_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create parent login by phone number
-- Converts phone number to email format for Supabase auth
-- Returns the generated password so the coach can share it with the parent.
-- (Dropped first: the return type changed from UUID to TEXT, which
-- CREATE OR REPLACE cannot alter.)
DROP FUNCTION IF EXISTS admin_create_parent_login(UUID, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION admin_create_parent_login(
  student_id UUID,
  login_phone TEXT,
  parent_name TEXT,
  new_password TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  synthetic_email TEXT;
  new_user_id UUID;
  generated_password TEXT;
BEGIN
  -- Only staff (coaches/captains) can call this
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can create parent accounts';
  END IF;

  -- Clean phone number (remove non-digits)
  login_phone := regexp_replace(login_phone, '[^0-9]', '', 'g');
  IF login_phone = '' THEN
    RAISE EXCEPTION 'A valid phone number is required';
  END IF;

  -- Create synthetic email
  synthetic_email := login_phone || '@parent.anandakarateclub.local';

  -- Check if email already exists
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = synthetic_email
  ) THEN
    RAISE EXCEPTION 'An account with this phone number already exists';
  END IF;

  -- Random 8-char alphanumeric password. NEVER a fixed default — a fixed
  -- default ("000000") is guessable by anyone who knows the phone number.
  generated_password := COALESCE(NULLIF(TRIM(new_password), ''), substr(md5(gen_random_uuid()::text), 1, 8));

  -- Prefer the supported Supabase admin helper when present; fall back to a
  -- manual insert (including the auth.identities row newer GoTrue versions
  -- require for email sign-in) on older projects.
  IF to_regprocedure('supabase_admin_create_user(jsonb)') IS NOT NULL THEN
    SELECT supabase_admin_create_user(jsonb_build_object(
      'email', synthetic_email,
      'password', generated_password,
      'email_confirm', true,
      'user_metadata', jsonb_build_object('role', 'parent', 'name', parent_name, 'must_change_password', true)
    )) INTO new_user_id;
  ELSE
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      synthetic_email,
      crypt(generated_password, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'parent', 'name', parent_name, 'must_change_password', true),
      NOW(), NOW(), '', '', '', ''
    )
    RETURNING id INTO new_user_id;

    -- Required identity row for email provider sign-in (GoTrue >= 2.5)
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      synthetic_email,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', synthetic_email, 'email_verified', true),
      'email',
      NOW(), NOW(), NOW()
    );
  END IF;

  -- Create the profile
  INSERT INTO profiles (id, role, name, student_id)
  VALUES (new_user_id, 'parent', parent_name, admin_create_parent_login.student_id);

  RETURN generated_password;
END;
$$;

-- Function to reset parent password (staff only).
-- Returns the new password so the coach can share it.
-- (Dropped first: the return type changed from VOID to TEXT.)
DROP FUNCTION IF EXISTS admin_reset_parent_password(UUID, TEXT);
CREATE OR REPLACE FUNCTION admin_reset_parent_password(
  target_user_id UUID,
  new_password TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_password TEXT;
BEGIN
  -- Only staff (coaches/captains) can call this
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can reset passwords';
  END IF;

  -- Only allow resetting parent accounts
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = target_user_id AND role = 'parent'
  ) THEN
    RAISE EXCEPTION 'Can only reset passwords for parent accounts';
  END IF;

  generated_password := COALESCE(NULLIF(TRIM(new_password), ''), substr(md5(gen_random_uuid()::text), 1, 8));

  -- Update the password and flag that it must be changed on next sign-in
  UPDATE auth.users
  SET encrypted_password = crypt(generated_password, gen_salt('bf')),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) ||
        jsonb_build_object('must_change_password', true),
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN generated_password;
END;
$$;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_settings_updated_at
  BEFORE UPDATE ON club_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();