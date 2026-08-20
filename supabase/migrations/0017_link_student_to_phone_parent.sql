-- BUG-01: Expose a SECURITY DEFINER function so the client can correctly link
-- a student to an existing parent account identified by phone number, without
-- ever touching auth.users directly.
CREATE OR REPLACE FUNCTION link_student_to_phone_parent(
  login_phone TEXT,
  p_student_id UUID
)
RETURNS UUID   -- returns the parent_id that was linked
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  clean_phone TEXT;
  synthetic_email TEXT;
  existing_parent_id UUID;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Only coaches and captains can manage parent links';
  END IF;
  clean_phone     := regexp_replace(login_phone, '[^0-9]', '', 'g');
  synthetic_email := clean_phone || '@parent.anandakarateclub.local';
  SELECT p.id INTO existing_parent_id
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = synthetic_email AND p.role = 'parent';
  IF existing_parent_id IS NULL THEN
    RAISE EXCEPTION 'No parent account found for this phone number';
  END IF;
  INSERT INTO parent_students (parent_id, student_id)
  VALUES (existing_parent_id, p_student_id)
  ON CONFLICT DO NOTHING;
  RETURN existing_parent_id;
END;
$$;
GRANT EXECUTE ON FUNCTION link_student_to_phone_parent(TEXT, UUID) TO authenticated;
