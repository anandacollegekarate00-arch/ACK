# 🚀 Quick Start Guide - Get Running in 10 Minutes

## What You Need

✅ Supabase account (free)  
✅ Your `index.html` file  
✅ 10 minutes

---

## Step 1: Create Supabase Project (2 mins)

1. Go to **https://supabase.com** → Sign up/Login
2. Click **"New Project"**
3. Fill in:
   - Name: `Ananda Karate`
   - Database Password: (create a strong one and SAVE IT!)
   - Region: `Southeast Asia (Singapore)` or closest
4. Click **"Create new project"**
5. ⏳ Wait 2 minutes while it sets up

---

## Step 2: Create Database (3 mins)

1. In your Supabase project, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the `database-schema.sql` file in a text editor
4. **Copy ALL of it** (Ctrl+A, Ctrl+C)
5. **Paste into Supabase** SQL Editor (Ctrl+V)
6. Click **"Run"** or press **Ctrl+Enter**
7. ✅ Should see: "Success. No rows returned"

---

## Step 3: Get Your Credentials (1 min)

1. Click **Settings** (⚙️ icon, bottom left)
2. Click **API**
3. You'll see:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Keep this tab open!** You'll need these in the next step

---

## Step 4: Connect the App (2 mins)

### Option A: Use Setup Screen (Easiest)

1. Open `index.html` in your browser (just double-click it)
2. You'll see a connection setup screen
3. Paste your **Project URL** and **anon public** key
4. Click **"Connect"**
5. ✅ Done! It saves automatically

### Option B: Edit the File (For permanent setup)

1. Open `index.html` in Notepad or any text editor
2. Press Ctrl+F and search for: `DEFAULT_SUPABASE_URL`
3. You'll see two lines like this:
   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://velrrklvyefnpvrkidww.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'sb_publishable_YHyncslQiCaJk7wXcrk01Q_iFXZCozu';
   ```
4. Replace with YOUR values from Step 3:
   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY_HERE';
   ```
5. Save the file (Ctrl+S)

---

## Step 5: Create Your Admin Account (2 mins)

1. Back in Supabase, click **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - Email: `coach@anandakarate.com` (or your email)
   - Password: (choose a good one!)
   - ✅ Check **"Auto Confirm User"**
4. Click **"Create user"**
5. **Copy the User ID** (long UUID like `3fa85f64-5717-4562-b3fc-2c963f66afa6`)

6. Go back to **SQL Editor**
7. Run this query (paste YOUR User ID):
   ```sql
   INSERT INTO profiles (id, role, name)
   VALUES ('PASTE_YOUR_USER_ID_HERE', 'coach', 'Your Name');
   ```
8. Click **"Run"**

---

## Step 6: Log In! 🎉

1. Refresh `index.html` in your browser
2. Enter your email and password
3. Click **"Sign in"**
4. 🎊 **You're in!**

---

## What to Do Next

### Add Your First Student

1. Click **Students** tab (bottom nav)
2. Click the **+** button (bottom right)
3. Fill in the form
4. Click **"Save Student"**

### Add Training Sessions

1. Go to **Profile** tab
2. Scroll to **"Training Sessions"**
3. Add your training schedule (e.g., "Monday & Wednesday 4:30 PM")

### Mark Attendance

1. Go to **Attendance** tab
2. Select today's date
3. Click **"Scan"** to use QR code (if on phone)
4. Or click **"Mark Manually"** to select students

---

## 🆘 Common Issues

### "Failed to load profile"

- Did you run Step 5? You need to insert your profile record
- Check that User ID matches exactly (no extra spaces)

### "Connection failed"

- Check your Project URL has `https://` at the start
- Verify the anon key is the full long string
- Make sure your Supabase project is not paused

### Can't log in

- Use the exact email you created in Step 5
- Remember to check "Auto Confirm User" when creating the account
- Try password reset in Supabase Authentication panel

### Database errors

- Make sure you ran the ENTIRE `database-schema.sql` file
- Check SQL Editor for red error messages
- If needed, re-run the file (it's safe to run multiple times)

---

## 🚀 Deploy Online (Optional)

Want others to access it? Upload to:

**Netlify** (Easiest):

1. Go to https://app.netlify.com/drop
2. Drag your `index.html` file
3. Get instant HTTPS URL!

**Vercel**:

1. Go to https://vercel.com
2. Create account (free)
3. Click "Add New..." → "Project"
4. Drag your file or connect GitHub

---

## 📚 Full Documentation

See `SETUP.md` for detailed explanations and troubleshooting.

## 🔒 Security Notes

- ✅ The **anon public** key is SAFE to expose in your code
- ❌ NEVER share your **Database Password** or **service_role** key
- 🔐 Change parent passwords from default `000000`
- 💾 Regularly backup your data in Supabase dashboard

---

**Need help?** Check the browser console (press F12) for error messages!
