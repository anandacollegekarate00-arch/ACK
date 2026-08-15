import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const envFile = join(root, '.env.local');
if (!existsSync(envFile)) {
  console.error('Missing .env.local with SUPABASE_DB_URL');
  process.exit(1);
}
const url = readFileSync(envFile, 'utf8').match(/SUPABASE_DB_URL=(.*)/)[1].trim();
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

await c.connect();
const drops = await c.query(
  `SELECT table_name, column_name FROM information_schema.columns
   WHERE (table_name='achievements' AND column_name='points')
      OR (table_name='club_settings' AND column_name='weight_attendance')`
);
console.log('gamification columns left:', drops.rowCount);
const rls = await c.query(
  `SELECT tablename FROM pg_tables WHERE schemaname='public' AND NOT rowsecurity ORDER BY tablename`
);
console.log('tables WITHOUT RLS:', rls.rows.length === 0 ? 'none' : rls.rows.map((r) => r.tablename).join(', '));
const funcs = await c.query(
  `SELECT proname FROM pg_proc
   WHERE proname IN ('is_staff','is_parent_of','assign_admission_id','admin_create_parent_login','admin_reset_parent_password')`
);
console.log('helper functions:', funcs.rows.map((r) => r.proname).join(', '));
const trig = await c.query(
  `SELECT tgname FROM pg_trigger WHERE NOT tgisinternal AND tgrelid='students'::regclass`
);
console.log('students triggers:', trig.rows.map((r) => r.tgname).join(', '));
const counters = await c.query('SELECT * FROM admission_counters');
console.log('admission_counters rows:', counters.rowCount);
await c.end();