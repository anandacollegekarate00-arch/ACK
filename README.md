# Ananda College Karate Club — Management System

Student management, attendance tracking, tournament management, and achievement
records for the Ananda College Karate Club — a mobile-first web app used by
coaches and parents.

## Stack

- **Frontend**: React 18 + TypeScript, Vite 5, Tailwind CSS
- **Data**: Supabase (PostgreSQL + Auth + Realtime)
- **PWA**: vite-plugin-pwa (installable, offline-capable)
- **Quality**: Vitest unit tests, ESLint, Prettier, GitHub Actions CI
- **Deployment**: Firebase Hosting at [anandacollegekarate.web.app](https://anandacollegekarate.web.app)

The Supabase project is baked into `src/lib/supabase.ts` — visitors get the
club's own project automatically, no setup screen, no per-device config.

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server on :3000
```

### Scripts

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Dev server with hot reload              |
| `npm run build`        | Typecheck + production build to `dist/` |
| `npm run preview`      | Serve the production build locally      |
| `npm test`             | Run the unit test suite (Vitest)        |
| `npm run lint`         | ESLint over `src/`                      |
| `npm run format`       | Prettier write                          |
| `npm run format:check` | Verify formatting (used by CI)          |

## Database

The schema lives in `supabase/migrations/` and is applied through the Supabase
SQL Editor (or the Supabase CLI):

1. `0001_initial_schema.sql` — all tables, RLS policies, triggers, and helper
   functions (admission-ID counter, parent-account functions).
2. `0002_remove_gamification.sql` — drops the old `achievements.points` and
   `club_settings.weight_attendance` columns on existing databases.

`database-schema.sql` is the same schema in a single file, kept for reference.

Key points:

- **Admission IDs are server-assigned** by the `assign_admission_id` trigger
  (per-year `ACK-YYYY-NNN` counter) — clients never set them, so two coaches
  can't race for the same number.
- **RLS is on everywhere**: coaches/captains manage everything; parents only
  read their own linked student's rows.
- **De-gamified**: results are stored as real placements
  (Gold/Silver/Bronze/…); no synthetic point values. Analytics ("Top Players")
  is derived from placements, attendance, and participation.

## Project structure

```
src/
├── components/   # UI primitives, charts, QR scanner, navigation
├── features/     # One module per screen (students, attendance, …)
├── hooks/        # useAuth, useClubData (Supabase + realtime)
├── lib/          # Pure logic: csv, attendance math, tournament stats,
│                 # dates, identity, qr, theme, supabase client
├── types.ts      # Domain entities (mirror the Postgres schema)
├── App.tsx       # Root: routing, auth gate, error boundary
└── main.tsx      # Entry point
```

`legacy/` holds the previous single-file HTML apps (and the abandoned first
Vite attempt) for reference; the app itself no longer uses them.

## Deployment

Firebase Hosting:

- **Live URL**: [anandacollegekarate.web.app](https://anandacollegekarate.web.app)
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Auto-deploys via GitHub Actions on push to `main`

The GitHub Actions workflow (`.github/workflows/firebase-hosting-merge.yml`) 
runs build and deployment automatically. CI workflow (`.github/workflows/ci.yml`) 
runs lint, format check, typecheck, and tests on every push/PR.

## Testing

The pure-logic modules (`src/lib/*`) are covered by Vitest suites in
`src/lib/__tests__/` — CSV parsing/import mapping, attendance math
(late-as-half-credit rates, period ranges, absence streaks), tournament
analytics, date/timezone handling, and identity helpers.

```bash
npm test          # one-shot
npm run test:watch
```
