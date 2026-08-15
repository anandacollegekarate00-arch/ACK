# Ananda College Karate Web App - Setup Guide

## Prerequisites

- A Supabase account (free tier works fine)
- Modern web browser
- Text editor (optional, for customization)

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: Ananda Karate Club (or your preferred name)
   - **Database Password**: Choose a strong password and save it
   - **Region**: Choose closest to Sri Lanka (e.g., Singapore)
5. Click "Create new project" and wait 2-3 minutes for setup

## Step 2: Create Database Tables

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the entire contents of `database-schema.sql` (in this folder)
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" - this is correct!

## Step 3: Set Up Row Level Security (RLS) Policies

The schema file includes basic RLS policies, but you should verify:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Ensure policies are created for each table
3. Key policies:
   - **Coaches** can read/write all data
   - **Parents** can only read their own student's data
   - **Public** cannot access anything without authentication

## Step 4: Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
3. **IMPORTANT**: Keep these safe but note they are PUBLIC keys (safe for client-side use)

## Step 5: Connect the App to Your Database

### Option A: Using the Built-in Setup Screen (Recommended)

1. Open `index.html` in your browser
2. You'll see a setup screen asking for Supabase credentials
3. Paste your **Project URL** and **anon/public key**
4. Click "Connect"
5. The credentials are saved in your browser's localStorage

### Option B: Hardcode the Credentials (For Deployment)

1. Open `index.html` in a text editor
2. Find these lines (around line 3402-3404):
   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://velrrklvyefnpvrkidww.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'sb_publishable_YHyncslQiCaJk7wXcrk01Q_iFXZCozu';
   ```
3. Replace with YOUR credentials:
   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';
   ```
4. Save the file

## Step 6: Create Your First Admin/Coach Account

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter:
   - **Email**: your email (e.g., coach@anandakarate.com)
   - **Password**: choose a secure password
   - **Auto Confirm User**: ✓ (check this box)
4. Click "Create user"
5. Copy the User ID (UUID) that appears

6. Go to **SQL Editor** and run this query (replace `YOUR_USER_ID`):
   ```sql
   INSERT INTO profiles (id, role, name)
   VALUES ('YOUR_USER_ID', 'coach', 'Your Name');
   ```

## Step 7: Log In and Start Using the App

1. Open `index.html` in your browser (or refresh if already open)
2. Enter your coach email and password
3. Click "Sign in"
4. You should see the Dashboard!

## Step 8: Add Students

1. Go to **Students** tab
2. Click the **+** button
3. Fill in student information
4. Click "Save Student"

## Troubleshooting

### "Failed to load profile" Error

- Make sure you created a profile record in Step 6
- Check that the User ID matches exactly

### "Connection failed" Error

- Verify your Supabase URL and anon key are correct
- Check if your Supabase project is active (not paused)
- Clear browser cache and try again

### Tables Not Created

- Make sure you ran the ENTIRE `database-schema.sql` file
- Check the SQL Editor for error messages
- Drop all tables and re-run if needed:
  ```sql
  DROP TABLE IF EXISTS attendance CASCADE;
  DROP TABLE IF EXISTS achievements CASCADE;
  -- etc...
  ```

### Parent Login Not Working

- Parent accounts use phone numbers as login (converted to email format)
- Default password is `000000` (six zeros)
- Parents log in with format: `94771234567@parent.anandakarateclub.local`

## Deployment Options

### Option 1: Vercel (Recommended)

1. Create account at [vercel.com](https://vercel.com)
2. Drag and drop your `index.html` file
3. Done! You get a free HTTPS URL

### Option 2: Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Done! Free HTTPS URL

### Option 3: GitHub Pages

1. Create a GitHub account
2. Create a new repository
3. Upload `index.html`
4. Enable GitHub Pages in repository settings
5. Your app will be at `yourusername.github.io/repo-name`

## Security Best Practices

1. **Never share your database password** (from Step 1)
2. **The anon key is safe to expose** in client-side code
3. **Use strong passwords** for coach accounts
4. **Change default parent passwords** (000000) immediately
5. **Regularly backup your data** using Supabase's backup features
6. **Enable 2FA** on your Supabase account

## Next Steps

- Customize the app name and colors
- Add training sessions in the Settings tab
- Create tournament series for competitions
- Set up parent accounts for guardians
- Export data regularly for backups

## Need Help?

- Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Inspect browser console (F12) for error messages
- Verify RLS policies if data isn't showing
