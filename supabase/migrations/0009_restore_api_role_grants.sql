-- ============================================================================
-- 0009: restore table grants for the API roles
-- ----------------------------------------------------------------------------
-- The live database lost the anon/authenticated/service_role grants on the
-- public tables (they only exist for authenticated), so every anonymous REST
-- call fails with 401 "permission denied for table students". This restores
-- Supabase's standard default ACLs: full grants on all tables/sequences/
-- functions to all three API roles (RLS is the actual access gate), and
-- default privileges so objects created later keep working.
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;