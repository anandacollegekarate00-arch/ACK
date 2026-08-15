# 📦 Install Supabase CLI on Windows

## Method 1: Using Scoop (Recommended - Easiest)

### Step 1: Install Scoop (if you don't have it)

Open PowerShell and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Step 2: Install Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 3: Verify Installation

```powershell
supabase --version
```

✅ You should see version number like `1.x.x`

---

## Method 2: Using Winget (Windows Package Manager)

### If you have Windows 11 or Windows 10 with App Installer:

Open PowerShell or Command Prompt and run:

```powershell
winget install Supabase.CLI
```

### Verify Installation

```powershell
supabase --version
```

**Note:** If command not found after install, restart your terminal or add to PATH manually.

---

## Method 3: Direct Download (Manual Install)

### Step 1: Download

1. Go to: https://github.com/supabase/cli/releases/latest
2. Download the Windows version: `supabase_windows_amd64.tar.gz`

### Step 2: Extract

1. Extract the `.tar.gz` file (you may need 7-Zip or WinRAR)
2. You'll get a file called `supabase.exe`

### Step 3: Add to PATH

**Option A: Move to System32 (Simple)**

1. Copy `supabase.exe`
2. Paste it into: `C:\Windows\System32\`
3. Requires admin permissions

**Option B: Create Custom Folder (Recommended)**

1. Create folder: `C:\Program Files\Supabase\`
2. Copy `supabase.exe` into it
3. Add to PATH:
   - Press `Win + X` → Select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Supabase\`
   - Click OK on all dialogs

### Step 4: Restart Terminal

Close and reopen PowerShell or Command Prompt

### Step 5: Verify

```powershell
supabase --version
```

---

## Method 4: Using NPM (If you have Node.js)

### Install globally with npm:

```powershell
npm install -g supabase
```

### Verify Installation

```powershell
supabase --version
```

**Note:** This installs an npm wrapper that downloads the binary on first use.

---

## After Installation: Set Up Your Project

Once Supabase CLI is installed:

### 1. Login to Supabase

```powershell
supabase login
```

- This will open your browser
- Log in to your Supabase account
- Authorize the CLI

### 2. Initialize Your Project

In your project folder (`ACK WEB`):

```powershell
cd "C:\Users\User\Desktop\ACK WEB"
supabase init
```

This creates a `supabase/` folder with:

- `migrations/` - Database migrations
- `config.toml` - Project configuration

### 3. Link to Your Hosted Project

```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

**How to find your project ref:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID" (looks like: `abcdefghijk`)

Or use the interactive selector:

```powershell
supabase link
```

### 4. Verify Connection

```powershell
supabase projects list
```

You should see your project listed!

---

## Troubleshooting

### "supabase: command not found" after installation

**Solution 1: Restart Terminal**

- Close PowerShell completely
- Open a new PowerShell window

**Solution 2: Check PATH**

```powershell
$env:Path -split ';' | Select-String supabase
```

If nothing shows, the PATH wasn't updated correctly.

**Solution 3: Use Full Path**
Find where supabase was installed:

```powershell
Get-Command supabase -ErrorAction SilentlyContinue
```

### Scoop installation fails

**Check if Scoop is installed:**

```powershell
scoop --version
```

If not installed, follow Method 1 Step 1 to install Scoop first.

### Winget installation fails

**Update winget:**

1. Open Microsoft Store
2. Search for "App Installer"
3. Update it
4. Try winget install again

### Permission errors

**Run PowerShell as Administrator:**

1. Right-click PowerShell
2. Select "Run as Administrator"
3. Try installation again

### Network/Download errors

Try a different method (Methods 1-4) or:

- Check your internet connection
- Disable VPN temporarily
- Try from a different network

---

## Verify Installation Checklist

After installation, verify everything works:

```powershell
# Check version
supabase --version

# Check if logged in
supabase projects list

# If not logged in
supabase login

# Initialize project (in your ACK WEB folder)
cd "C:\Users\User\Desktop\ACK WEB"
supabase init

# Link to hosted project
supabase link
```

---

## Quick Commands Reference

```powershell
# Login
supabase login

# Initialize new project
supabase init

# Link to hosted project
supabase link --project-ref YOUR_REF

# Check status
supabase status

# List projects
supabase projects list

# Get project details
supabase projects list --format json

# Generate types
supabase gen types typescript --linked

# Pull remote migrations
supabase db pull

# Push local migrations
supabase db push

# Check differences
supabase db diff

# Help
supabase --help
```

---

## What's Next?

After installing and setting up Supabase CLI:

1. ✅ Link your project: `supabase link`
2. ✅ Run the database schema through Supabase dashboard (easiest)
3. ✅ Or create migrations with: `supabase migration new init_schema`
4. ✅ Pull remote changes: `supabase db pull`
5. ✅ Generate types: `supabase gen types typescript --linked`

---

## Need Help?

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Installation Issues**: https://github.com/supabase/cli/issues
- **Windows PATH Guide**: https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/

---

## My Recommendation

**For Windows users:**

1. **Easiest**: Use **Scoop** (Method 1)
   - One command install
   - Automatic PATH setup
   - Easy to update later

2. **If Scoop fails**: Use **Direct Download** (Method 3)
   - Most reliable
   - No dependencies
   - Manual PATH setup

3. **If you have Node.js**: Use **NPM** (Method 4)
   - Quick install
   - Already familiar with npm

**Avoid:** Winget (Method 2) - can be buggy with PATH setup on Windows

---

**Current Status:** Ready to install! Choose your method and run the commands above.

Need me to help with the actual installation? Just let me know which method you want to try!
