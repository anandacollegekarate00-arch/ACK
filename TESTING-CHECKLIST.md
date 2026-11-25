# Sign-Up Feature — Testing Checklist

Use this checklist to verify the sign-up feature is working correctly in production.

---

## 🧪 Test 1: New User Sign-Up (Happy Path)

**Steps:**
1. Open your deployed site: https://anandacollegekarate.web.app
2. Click "Sign up" link at bottom of login form
3. Fill in:
   - Full Name: `Test Parent`
   - Email: `testparent123@gmail.com` (use a real email you control)
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Create Account"

**Expected Result:**
- ✅ Success screen appears: "Account Created!"
- ✅ Shows message: "Your account has been created successfully. You can now sign in."
- ✅ "Go to Sign In" button visible

5. Click "Go to Sign In"

**Expected Result:**
- ✅ Returns to login screen

6. Log in with the new account

**Expected Result:**
- ✅ Logs in successfully
- ✅ Lands on Parent dashboard
- ✅ Dashboard is empty (no students shown)
- ✅ Message like "No students linked yet" or empty state

---

## 🧪 Test 2: Password Validation

**Steps:**
1. Go to sign-up page
2. Enter name and email
3. Enter password: `12345` (less than 6 chars)
4. Enter confirm password: `12345`
5. Click "Create Account"

**Expected Result:**
- ✅ Error shown: "Password must be at least 6 characters."
- ✅ Account NOT created

---

## 🧪 Test 3: Password Mismatch

**Steps:**
1. Go to sign-up page
2. Enter name and email
3. Enter password: `password123`
4. Enter confirm password: `password456` (different)
5. Click "Create Account"

**Expected Result:**
- ✅ Error shown: "Passwords do not match."
- ✅ Account NOT created

---

## 🧪 Test 4: Duplicate Email

**Steps:**
1. Go to sign-up page
2. Try signing up with the same email from Test 1
3. Click "Create Account"

**Expected Result:**
- ✅ Error shown: "This email is already registered. Please sign in instead."
- ✅ Duplicate account NOT created

---

## 🧪 Test 5: Account Not Found → Create Account

**Steps:**
1. Go to login page
2. Enter email: `nonexistent@example.com`
3. Enter password: `anything`
4. Click "Sign in"

**Expected Result:**
- ✅ Error shown: "We couldn't find an account with these details."
- ✅ "Create Account" button appears
- ✅ Clicking it redirects to sign-up page

---

## 🧪 Test 6: Existing Coach Login (Regression)

**Steps:**
1. Go to login page
2. Log in with an existing coach/captain account

**Expected Result:**
- ✅ Logs in successfully
- ✅ Lands on Dashboard (not Parent view)
- ✅ All features work normally
- ✅ Attendance, students, achievements all visible

---

## 🧪 Test 7: Security — New User Role

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to: Table Editor → profiles
3. Find the test account from Test 1
4. Check the `role` column

**Expected Result:**
- ✅ Role is exactly `parent` (not coach, captain, or senior_player)

---

## 🧪 Test 8: Security — No Auto Student Link

**Steps:**
1. In Supabase Dashboard
2. Navigate to: Table Editor → parent_students
3. Filter by the test account user ID

**Expected Result:**
- ✅ No rows found (empty)
- ✅ New parent NOT automatically linked to any student

---

## 🧪 Test 9: Mobile Responsive

**Steps:**
1. Open site on mobile device or resize browser to mobile width
2. Navigate to sign-up page
3. Fill in form

**Expected Result:**
- ✅ Form fits screen properly
- ✅ All fields visible and usable
- ✅ Logo and branding display correctly
- ✅ Success screen readable on mobile

---

## 🧪 Test 10: Return to Login

**Steps:**
1. Go to sign-up page
2. Click "Already have an account? Sign in" link at bottom

**Expected Result:**
- ✅ Returns to login page
- ✅ No data lost
- ✅ Login form ready to use

---

## ✅ All Tests Passed?

If all tests above pass, the sign-up feature is working correctly!

### Next Steps:
1. Test with real users (parents of students)
2. Have a coach link the new parent to their student(s)
3. Verify parent can see their linked student's data

### If Any Test Fails:
- Check browser console for errors (F12)
- Check Supabase Dashboard → Logs for backend errors
- Review `SIGNUP-IMPLEMENTATION.md` for rollback instructions

---

**Checklist Version:** 1.0  
**Last Updated:** January 25, 2025
