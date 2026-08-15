import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function loadEnv() {
  const f = join(root, '.env.local');
  if (!existsSync(f)) return {};
  const out = {};
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv();
const conn = env.SUPABASE_DB_URL || process.env.SUPABASE_DB_URL;
if (!conn) {
  console.error('Missing SUPABASE_DB_URL. Add it to .env.local (gitignored) like:');
  console.error('SUPABASE_DB_URL=postgresql://postgres.XXXX:password@aws-0-....pooler.supabase.com:6543/postgres');
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node tools/run-migrations.mjs <file.sql> [file2.sql ...]');
  process.exit(1);
}

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected to', client.connectionParameters.host, 'as', client.connectionParameters.user);
  for (const f of files) {
    const path = join(root, f);
    const sql = readFileSync(path, 'utf8');
    console.log(`\n--- ${f} (${sql.length} bytes) ---`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('OK');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('FAILED (rolled back):', e.message);
      process.exitCode = 1;
    }
  }
  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  );
  console.log('\nPublic tables now:', rows.map((r) => r.tablename).join(', '));
} catch (e) {
  console.error('Connection failed:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}