-- ==============================================================================
-- 3+2 SPECIALTY COFFEE — MIGRATION 002: TABLE PRIVILEGES & ROLE PERMISSIONS
-- Fixes PostgreSQL error 42501 (permission denied for table) by granting
-- standard schema and table access to Supabase 'anon' and 'authenticated' roles.
-- ==============================================================================

-- 1. Grant schema usage
grant usage on schema public to anon, authenticated;

-- 2. Grant table permissions
-- 'anon' and 'authenticated' can SELECT (filtered by RLS policies)
grant select on all tables in schema public to anon, authenticated;

-- 'authenticated' (owner) can INSERT, UPDATE, DELETE (governed by RLS policies)
grant all on all tables in schema public to authenticated;

-- 3. Grant sequence permissions for auto-incrementing / serial fields
grant usage, select on all sequences in schema public to authenticated;

-- 4. Set default privileges for future tables
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
