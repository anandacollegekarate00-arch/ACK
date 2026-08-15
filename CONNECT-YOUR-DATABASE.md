# 🔌 Connect Your Supabase Database

## Current Status

Your app currently has **placeholder/demo credentials** in the code:

```
URL: https://velrrklvyefnpvrkidww.supabase.co
Key: sb_publishable_YHyncslQiCaJk7wXcrk01Q_iFXZCozu
```

These are NOT real and won't work. You need to replace them with YOUR Supabase credentials.

---

## 📍 Where to Find Your Credentials

### Step 1: Go to Your Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Log in to your account
3. Select your project (or create one if you haven't)

### Step 2: Navigate to API Settings

1. Click the **⚙️ Settings** icon (bottom left sidebar)
2. Click **"API"** in the settings menu

### Step 3: Copy These Two Values

You'll see a section called "Project API keys". Copy:

#### 1️⃣ Project URL

```
https://YOUR-PROJECT-ID.supabase.co
```

📋 This will look something like: `https://abcdefghijk.supabase.co`

#### 2️⃣ anon public Key

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

📋 This is a LONG string (100+ characters) starting with `eyJ`

**⚠️ IMPORTANT**: Copy the **"anon public"** key, NOT the "service_role" key!

---

## 🔧 How to Connect (Choose ONE Method)

### Method A: Using the Setup Screen (Easiest - Recommended)

1. **Open** `index.html` in your browser (double-click the file)
2. You'll see a blue setup screen that says "Connect to Supabase"
3. **Paste** your Project URL in the first box
4. **Paste** your anon public key in the second box
5. Click **"Connect"**
6. ✅ **Done!** The credentials are saved in your browser

**Pros:**

- ✅ No code editing needed
- ✅ Easy to change later
- ✅ Works immediately

**Cons:**

- ❌ Only works on YOUR browser
- ❌ Other users need to enter credentials too
- ❌ Lost if you clear browser data

---

### Method B: Edit the File (For Deployment)

This is better if you want to:

- Deploy the app online
- Share with others
- Have credentials permanent

#### Instructions:

1. **Open** `index.html` in a text editor (Notepad, VS Code, etc.)

2. **Find** these lines (press Ctrl+F and search for `DEFAULT_SUPABASE_URL`):

   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://velrrklvyefnpvrkidww.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'sb_publishable_YHyncslQiCaJk7wXcrk01Q_iFXZCozu';
   ```

3. **Replace** with YOUR credentials:

   ```javascript
   const DEFAULT_SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
   const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_FULL_KEY';
   ```

4. **Save** the file (Ctrl+S)

5. **Refresh** your browser

**Pros:**

- ✅ Works for everyone
- ✅ Permanent solution
- ✅ Good for deployment

**Cons:**

- ❌ Requires editing code
- ❌ Need to re-edit if credentials change

---

## 📱 What You'll See After Connecting

### ✅ Success

After connecting, you should see:

- A login screen with email/password fields
- No red error messages
- A "Sign in" button ready to use

### ❌ If It Doesn't Work

You might see:

- "Connection failed" error
- Red text saying credentials are invalid
- Blank screen or stuck loading

**Solutions:**

1. Double-check you copied the FULL key (it's very long!)
2. Make sure there are no extra spaces before/after
3. Verify the URL has `https://` at the start
4. Check your Supabase project is not paused
5. Try Method A first to test credentials before editing the file

---

## 🔍 Verify Your Connection

### Quick Test:

1. Open browser console (press **F12**)
2. Click the **Console** tab
3. Look for errors:
   - ✅ **Good**: No red errors, or just warnings
   - ❌ **Bad**: "Failed to create client" or "Invalid API key"

### Check in Supabase:

1. Go to your Supabase project
2. Click **API** in settings
3. Under "Configuration", check that:
   - **Project URL** is exactly what you copied
   - **anon public** key is exactly what you copied

---

## 🔐 Security Note

### Safe to Share (Public Keys)

The credentials you're using are **PUBLIC KEYS** - they are SAFE to expose in:

- ✅ Client-side code (like this app)
- ✅ Browser console
- ✅ Public websites
- ✅ GitHub repositories

They only allow **authorized access** through Row Level Security (RLS) policies.

### DO NOT Share (Secret Keys)

❌ **Database password** (set when creating project)  
❌ **service_role key** (has admin access)  
❌ **User passwords** (coach/parent login passwords)

---

## 🆘 Troubleshooting

### "Invalid API key format"

- The key should start with `eyJ`
- It should be 100+ characters long
- No spaces at the beginning or end
- Copy it again from Supabase

### "Cannot connect to server"

- Check your internet connection
- Verify the URL has `https://` at the start
- Make sure the project ID in the URL is correct
- Check if your Supabase project is paused (happens after 7 days of inactivity on free tier)

### "Failed to create client"

- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private mode
- Check browser console for specific error messages

### Credentials Keep Being Asked

If using Method A (setup screen):

- Credentials are saved in browser localStorage
- Clearing browser data removes them
- Use Method B to hardcode them permanently

---

## ✅ Next Steps After Connecting

Once connected successfully:

1. **Set up database** → See `QUICKSTART.md` Step 2
2. **Create admin account** → See `QUICKSTART.md` Step 5
3. **Log in** → See `QUICKSTART.md` Step 6
4. **Start using the app!** 🎉

---

## 📞 Still Stuck?

1. ✅ Verify your Supabase project exists and is active
2. ✅ Check that you ran the database schema (`database-schema.sql`)
3. ✅ Try Method A first (setup screen) to test credentials
4. ✅ Look at browser console (F12) for specific errors
5. ✅ Make sure you're copying the **anon public** key, not service_role

**Need more help?** See `SETUP.md` for detailed troubleshooting guide.

---

## 📝 Quick Reference

### Your Credentials Template

```
Project URL: ________________________________

anon public key: ________________________________
________________________________
________________________________
(will be multiple lines long)
```

### File Location to Edit

```
File: index.html
Search for: DEFAULT_SUPABASE_URL
Line numbers: Around 3402-3404
```

### Where Credentials Are Saved (Method A)

```
Browser localStorage:
- Key: akc-supabase-url
- Key: akc-supabase-anon-key

To clear: Press F12 → Application tab → Local Storage → Clear
```
