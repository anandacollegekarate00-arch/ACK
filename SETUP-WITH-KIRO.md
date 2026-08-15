# 🚀 Setup Your Database with Kiro + Supabase

Since you've connected Supabase to Kiro, you have two easy options to set up your database:

---

## Option 1: Use Supabase Dashboard (Easiest - Recommended) ⭐

This is the simplest way since Supabase CLI is not installed locally.

### Step 1: Open Your Supabase Project

1. Go to https://supabase.com/dashboard
2. Select your connected project
3. You should see your project dashboard

### Step 2: Run the Database Schema

1. Click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the `database-schema.sql` file in this folder
4. **Select All** (Ctrl+A) and **Copy** (Ctrl+C)
5. **Paste** into the Supabase SQL Editor (Ctrl+V)
6. Click **Run** (or press Ctrl+Enter)
7. ✅ You should see: "Success. No rows returned"

### Step 3: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor**
2. You should see these tables:
   - profiles
   - students
   - attendance
   - sessions
   - achievements
   - tournaments
   - tournament_series
   - tournament_events
   - event_registrations
   - club_settings

### Step 4: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: The long key starting with `eyJ...`

### Step 5: Update Your App

Now you need to connect your `index.html` to your database:

**Method A: Use Setup Screen**

1. Open `index.html` in browser
2. Enter your Project URL and anon key
3. Click "Connect"

**Method B: Edit the File**

1. Open `index.html` in a text editor
2. Search for `DEFAULT_SUPABASE_URL` (around line 3402)
3. Replace both lines with your credentials:
   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY_HERE';
   ```
4. Save the file

### Step 6: Create Admin Account

1. In Supabase dashboard: **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and password
4. ✅ Check **"Auto Confirm User"**
5. Click **Create user**
6. **Copy the User ID** (UUID)

7. Go back to **SQL Editor** and run:
   ```sql
   INSERT INTO profiles (id, role, name)
   VALUES ('PASTE_YOUR_USER_ID_HERE', 'coach', 'Your Name');
   ```

### Step 7: Log In! 🎉

1. Open `index.html` in browser (or refresh)
2. Enter your email and password
3. Click "Sign in"
4. You're in!

---

## Option 2: Use Kiro with Supabase Power (Advanced)

If you want Kiro to help you manage your database:

### Step 1: Ask Kiro to Check Your Database

```
Hey Kiro, can you check what tables exist in my Supabase database?
```

### Step 2: Ask Kiro to Create Tables

```
Hey Kiro, please run the database-schema.sql file on my Supabase project
```

### Step 3: Ask Kiro for Help

Kiro can help you:

- Create tables
- Modify schema
- Add RLS policies
- Check database status
- Generate TypeScript types
- And more!

---

## What's the Difference?

### Supabase Dashboard (Option 1)

- ✅ Works immediately
- ✅ No setup needed
- ✅ Visual interface
- ✅ Simple for beginners
- ❌ Manual copy/paste

### Kiro Power (Option 2)

- ✅ AI-assisted
- ✅ Can automate tasks
- ✅ Great for changes
- ❌ Requires understanding MCP tools

**Recommendation:** Start with **Option 1** (Dashboard) to get your app running, then explore Option 2 (Kiro) for future updates.

---

## After Setup

Once your database is set up:

1. ✅ Add students through the app
2. ✅ Track attendance
3. ✅ Record achievements
4. ✅ Create parent accounts
5. ✅ Deploy online (see SETUP.md)

---

## Troubleshooting

### "Table already exists" error

- Your tables are already created! Skip to Step 4 (get credentials)

### Can't find SQL Editor

- Look in the left sidebar under "SQL Editor"
- It might be under "Database" section

### Wrong credentials

- Make sure you copied the **anon public** key, not service_role
- URL should start with `https://`
- No spaces before/after when pasting

---

## Need Help?

1. Check the browser console (F12) for errors
2. Verify your Supabase project is active (not paused)
3. Make sure you ran the COMPLETE database-schema.sql file
4. See SETUP.md for detailed troubleshooting

---

**Quick Start Path:**

1. Run database-schema.sql in Supabase Dashboard
2. Get your credentials
3. Update index.html
4. Create admin account
5. Log in!

**Time needed:** 10-15 minutes

---

_Since you have Kiro connected, you can also ask me to help with any of these steps!_
