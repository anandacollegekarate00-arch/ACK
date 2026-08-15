# ✅ Setup Checklist

Print this or check off as you complete each step!

---

## 📋 Pre-Setup

- [ ] I have a Supabase account
- [ ] I have the `index.html` file
- [ ] I have the `database-schema.sql` file
- [ ] I have a text editor (Notepad, VS Code, etc.)

---

## 🗄️ Supabase Project Setup

- [ ] Created new Supabase project
- [ ] Saved my database password somewhere safe
- [ ] Project is fully initialized (green checkmark in dashboard)
- [ ] I can access the project dashboard

---

## 💾 Database Setup

- [ ] Opened SQL Editor in Supabase
- [ ] Ran the entire `database-schema.sql` file
- [ ] Saw "Success. No rows returned" message
- [ ] Verified tables exist (can see them in Table Editor)
- [ ] Verified these tables exist:
  - [ ] profiles
  - [ ] students
  - [ ] attendance
  - [ ] sessions
  - [ ] achievements
  - [ ] tournaments
  - [ ] tournament_series
  - [ ] tournament_events
  - [ ] event_registrations
  - [ ] club_settings

---

## 🔑 Credentials

- [ ] Found Project URL in Settings → API
- [ ] Found anon public key in Settings → API
- [ ] Saved both in a safe place
- [ ] Updated `index.html` with my credentials (Option B), OR
- [ ] Ready to enter them in the setup screen (Option A)

---

## 👤 Admin Account

- [ ] Created user in Authentication → Users
- [ ] Checked "Auto Confirm User" when creating
- [ ] Saved the user's email and password
- [ ] Copied the User ID (UUID)
- [ ] Ran the INSERT INTO profiles query with my User ID
- [ ] Query executed successfully

---

## 🌐 App Connection

- [ ] Opened `index.html` in browser
- [ ] Entered credentials (if using setup screen)
- [ ] OR verified hardcoded credentials (if edited file)
- [ ] No console errors (press F12 to check)

---

## 🎯 First Login Test

- [ ] Entered my coach email
- [ ] Entered my coach password
- [ ] Clicked "Sign in"
- [ ] Successfully logged in
- [ ] Can see the Dashboard
- [ ] All 6 bottom navigation tabs are visible

---

## 📝 Basic Functionality Test

- [ ] Added a test student
- [ ] Student appears in Students list
- [ ] Can view student profile
- [ ] Can mark attendance for today
- [ ] Attendance saves successfully
- [ ] Can see attendance in Analytics tab

---

## ⚙️ Optional Setup

- [ ] Added training sessions in Profile → Settings
- [ ] Created parent account for a student
- [ ] Tested parent login
- [ ] Changed parent password from default
- [ ] Added a tournament
- [ ] Added student achievements

---

## 🚀 Deployment (Optional)

- [ ] Chose deployment platform (Netlify/Vercel/GitHub Pages)
- [ ] Uploaded app
- [ ] Got public URL
- [ ] Tested URL in browser
- [ ] Login works on deployed version
- [ ] Shared URL with team

---

## 🔒 Security Check

- [ ] My database password is saved securely
- [ ] I'm NOT sharing my database password
- [ ] I'm NOT sharing my service_role key (if I have it)
- [ ] Coach accounts have strong passwords
- [ ] Parent accounts will have passwords changed from 000000
- [ ] 2FA enabled on my Supabase account (recommended)

---

## 📚 Documentation

- [ ] Read the QUICKSTART.md
- [ ] Bookmarked SETUP.md for reference
- [ ] Know where to find Supabase docs
- [ ] Know how to check browser console for errors

---

## 🎓 Training/Handoff (if applicable)

- [ ] Trained other coaches on basic usage
- [ ] Documented our specific workflows
- [ ] Set up backup schedule
- [ ] Tested data export from Supabase
- [ ] Created documentation for parent access

---

## 🐛 Troubleshooting Resources

- [ ] Bookmarked Supabase documentation
- [ ] Know how to access browser console (F12)
- [ ] Know how to check Supabase logs
- [ ] Know how to check RLS policies
- [ ] Have contact for technical support

---

## ✨ All Done!

**Date Completed:** _______________

**Setup By:** _______________

**Notes:**

---

---

---

---

---

## 📞 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard

**My Project URL:** ________________________________

**Admin Email:** ________________________________

**Deployment URL (if deployed):** ________________________________

---

## Common Commands Cheat Sheet

### Verify Tables Exist

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check User Profiles

```sql
SELECT id, role, name, student_id FROM profiles;
```

### View All Students

```sql
SELECT id, admission_id, name, belt FROM students;
```

### Reset Parent Password Manually

```sql
UPDATE auth.users
SET encrypted_password = crypt('000000', gen_salt('bf'))
WHERE email = 'PHONE_NUMBER@parent.anandakarateclub.local';
```

### Check Row Level Security Status

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
