-- ============================================================================
-- 0009 — USER PERMISSIONS & MANAGEMENT SYSTEM
-- Replace parent login system with staff user management
-- Coaches/captains can grant granular permissions to senior players
-- ============================================================================

-- --- user_permissions table -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  can_mark_attendance BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  can_add_achievements BOOLEAN DEFAULT false,
  can_register_tournaments BOOLEAN DEFAULT false,
  can_promote_belts BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage permissions" ON public.user_permissions;
CREATE POLICY "Staff can manage permissions"
  ON public.user_permissions FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions"
  ON public.user_permissions FOR SELECT
  USING (user_id = auth.uid());

-- --- Permission check functions -------------------------------------------

CREATE OR REPLACE FUNCTION can_mark_attendance()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  -- Coaches and captains always can
  IF user_role IN ('coach', 'captain') THEN
    RETURN true;
  END IF;
  
  -- Senior players: check permissions table
  IF user_role = 'senior_player' THEN
    SELECT can_mark_attendance INTO has_permission 
    FROM user_permissions 
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(has_permission, false);
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION can_manage_students()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  IF user_role IN ('coach', 'captain') THEN
    RETURN true;
  END IF;
  
  IF user_role = 'senior_player' THEN
    SELECT can_manage_students INTO has_permission 
    FROM user_permissions 
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(has_permission, false);
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION can_add_achievements()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  IF user_role IN ('coach', 'captain') THEN
    RETURN true;
  END IF;
  
  IF user_role = 'senior_player' THEN
    SELECT can_add_achievements INTO has_permission 
    FROM user_permissions 
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(has_permission, false);
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION can_register_tournaments()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  IF user_role IN ('coach', 'captain') THEN
    RETURN true;
  END IF;
  
  IF user_role = 'senior_player' THEN
    SELECT can_register_tournaments INTO has_permission 
    FROM user_permissions 
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(has_permission, false);
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION can_promote_belts()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  IF user_role IN ('coach', 'captain') THEN
    RETURN true;
  END IF;
  
  IF user_role = 'senior_player' THEN
    SELECT can_promote_belts INTO has_permission 
    FROM user_permissions 
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(has_permission, false);
  END IF;
  
  RETURN false;
END;
$$;

-- --- Update RLS policies to use permission functions ----------------------

-- Students table: senior players with permission can manage
DROP POLICY IF EXISTS "Staff can manage all students" ON students;
CREATE POLICY "Staff can manage all students"
  ON students FOR ALL
  USING (can_manage_students())
  WITH CHECK (can_manage_students());

-- Attendance table: senior players with permission can mark
DROP POLICY IF EXISTS "Staff can manage all attendance" ON attendance;
CREATE POLICY "Staff can manage all attendance"
  ON attendance FOR ALL
  USING (can_mark_attendance())
  WITH CHECK (can_mark_attendance());

-- Achievements table: senior players with permission can add
DROP POLICY IF EXISTS "Staff can manage all achievements" ON achievements;
CREATE POLICY "Staff can manage all achievements"
  ON achievements FOR ALL
  USING (can_add_achievements())
  WITH CHECK (can_add_achievements());

-- Event registrations: senior players with permission can register
DROP POLICY IF EXISTS "Staff can manage event registrations" ON event_registrations;
CREATE POLICY "Staff can manage event registrations"
  ON event_registrations FOR ALL
  USING (can_register_tournaments())
  WITH CHECK (can_register_tournaments());
