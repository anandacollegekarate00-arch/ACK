import { readFileSync } from 'node:fs';
import pg from 'pg';
const url = readFileSync('.env.local', 'utf8').match(/SUPABASE_DB_URL=(.*)/)[1].trim();
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
const cols = await c.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'students' AND table_schema = 'public'
  ORDER BY ordinal_position
`);
console.log('students columns:', JSON.stringify(cols.rows, null, 1));
await c.end();