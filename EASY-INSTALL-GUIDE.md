# 🚀 Easy Supabase CLI Installation (Windows)

## 🎯 Quick Install - Copy & Paste Method

### Step 1: Open PowerShell

1. Press `Win + X`
2. Select **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**

### Step 2: Run ONE of These Commands

#### Option A: Using NPM (Recommended if you have Node.js)

```powershell
npm install -g supabase
```

**Wait 30-60 seconds for installation**

#### Option B: Using Scoop (Best for Windows)

```powershell
# First, install Scoop if you don't have it
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Then install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 3: Verify Installation

```powershell
supabase --version
```

✅ **You should see version like:** `1.210.4` or similar

---

## 🤔 Which Method Should I Use?

### Use NPM if:

- ✅ You already have Node.js installed
- ✅ You're familiar with npm
- ✅ You want the fastest install

### Use Scoop if:

- ✅ You don't have npm/Node.js
- ✅ You want proper Windows integration
- ✅ You want easy updates later

---

## 💡 After Installation: 4 Quick Commands

Once installed, run these in PowerShell:

### 1. Login to Supabase

```powershell
supabase login
```

- Opens browser
- Log in to your Supabase account
- Authorize the CLI

### 2. Go to Your Project Folder

```powershell
cd "C:\Users\User\Desktop\ACK WEB"
```

### 3. Initialize Supabase

```powershell
supabase init
```

- Creates `supabase/` folder
- Sets up configuration

### 4. Link Your Project

```powershell
supabase link
```

- Shows list of your projects
- Select the one you want to use
- Or use: `supabase link --project-ref YOUR_PROJECT_REF`

---

## 🎉 Done! You're Ready

Now you can:

- ✅ Run database migrations
- ✅ Generate TypeScript types
- ✅ Sync with hosted database
- ✅ Use Kiro to help manage your database

---

## 🆘 If Installation Fails

### Error: "cannot be loaded because running scripts is disabled"

**Fix:** Run this first:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "npm: command not found"

**Fix:** Install Node.js first:

1. Go to https://nodejs.org
2. Download and install LTS version
3. Restart PowerShell
4. Try npm install again

### Error: "supabase: command not found" after install

**Fix:**

1. Close PowerShell completely
2. Open a NEW PowerShell window
3. Try `supabase --version` again

### Still not working?

**Alternative:** Use the install script I created:

```powershell
cd "C:\Users\User\Desktop\ACK WEB"
.\install-supabase.ps1
```

---

## 📚 What You Can Do After Install

### Generate Database Types

```powershell
supabase gen types typescript --linked > types/database.types.ts
```

### Pull Remote Database Schema

```powershell
supabase db pull
```

### Check Database Differences

```powershell
supabase db diff
```

### Push Migrations

```powershell
supabase db push
```

---

## ⚡ Quick Reference

| Command                  | What It Does              |
| ------------------------ | ------------------------- |
| `supabase --version`     | Check if installed        |
| `supabase login`         | Login to account          |
| `supabase init`          | Initialize project        |
| `supabase link`          | Connect to hosted project |
| `supabase status`        | Check connection status   |
| `supabase projects list` | List your projects        |
| `supabase db pull`       | Sync remote changes       |
| `supabase db push`       | Push local changes        |
| `supabase db diff`       | Check differences         |

---

## 🎯 Your Next Step

**After installing Supabase CLI, you have two options:**

### Option 1: Use Supabase Dashboard (Simpler)

- Run `database-schema.sql` directly in Supabase web dashboard
- No CLI needed for initial setup
- See `SETUP-WITH-KIRO.md` for instructions

### Option 2: Use CLI + Kiro (Advanced)

- Let Kiro help you manage migrations
- Generate types automatically
- More control over database changes

**My recommendation:** Start with Option 1 (dashboard) to get your app running, then explore CLI features with Kiro!

---

## 📞 Need Help?

1. See `INSTALL-SUPABASE-CLI.md` for detailed troubleshooting
2. Run the install script: `.\install-supabase.ps1`
3. Or just use the Supabase dashboard (no CLI needed!)

---

**Ready?** Choose your install method and copy the commands above! 🚀
