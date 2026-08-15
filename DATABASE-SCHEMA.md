# Karate Club Database Schema

## Supabase Configuration

- **URL**: https://velrrklvyefnpvrkidww.supabase.co
- **Anon Key**: Stored in localStorage or defaults

## Tables

### 1. **students**

Primary student records

- `id` (uuid, primary key)
- `admission_id` (text, unique) - Generated ID
- `name` (text) - Short display name
- `full_name` (text) - Full legal name
- `dob` (date) - Date of birth
- `birth_cert_no` (text)
- `nic` (text) - National ID
- `grade` (text) - School grade/class
- `belt` (text) - Kyu rank (e.g., "White (10th Kyu)")
- `join_date` (date)
- `school_admission_no` (text)
- `association_admission_no` (text)
- `guardian_name` (text)
- `guardian_phone` (text)
- `guardian_whatsapp` (text)
- `guardian_email` (text)
- `guardian_address` (text)
- `photo_url` (text, optional)

### 2. **attendance**

Attendance records

- `id` (uuid, primary key)
- `student_id` (uuid, foreign key → students)
- `date` (date)
- `session_id` (uuid, nullable, foreign key → sessions)
- `status` (text) - 'present', 'late', 'absent'
- `marked_by` (uuid, foreign key → profiles)
- `notes` (text, nullable)

### 3. **achievements**

Tournament results and awards

- `id` (uuid, primary key)
- `student_id` (uuid, foreign key → students)
- `tournament_id` (uuid, nullable, foreign key → tournaments)
- `event_id` (uuid, nullable, foreign key → tournament_events)
- `title` (text) - Achievement name
- `position` (text) - e.g., "1st Place", "Gold"
- `level` (text) - 'School', 'Provincial', 'National', 'International'
- `points` (integer) - Points awarded
- `date` (date)
- `notes` (text, nullable)

### 4. **tournaments**

Tournament information

- `id` (uuid, primary key)
- `name` (text)
- `date` (date)
- `location` (text)
- `description` (text, nullable)
- `series_id` (uuid, nullable, foreign key → tournament_series)

### 5. **tournament_series**

Tournament series/championships

- `id` (uuid, primary key)
- `name` (text)
- `year` (integer)
- `description` (text, nullable)

### 6. **tournament_events**

Individual events within tournaments

- `id` (uuid, primary key)
- `tournament_id` (uuid, foreign key → tournaments)
- `name` (text) - e.g., "Kata U12", "Kumite Open"
- `category` (text) - 'kata', 'kumite', 'weapons'

### 7. **event_registrations**

Student registrations for tournament events

- `id` (uuid, primary key)
- `student_id` (uuid, foreign key → students)
- `event_id` (uuid, foreign key → tournament_events)
- `registered_at` (timestamp)

### 8. **sessions**

Training session definitions

- `id` (uuid, primary key)
- `name` (text) - e.g., "Monday Evening"
- `day_of_week` (integer) - 0=Sunday, 1=Monday, etc.
- `start_time` (time)
- `end_time` (time)

### 9. **club_settings**

Club configuration

- `id` (integer, primary key, always 1)
- `weight_attendance` (float) - Weight for attendance in scoring (default: 0.6)

### 10. **profiles**

User profiles (Supabase Auth integration)

- `id` (uuid, primary key, references auth.users)
- `role` (text) - 'admin', 'coach', 'parent'
- `name` (text)
- `student_id` (uuid, nullable, foreign key → students) - For parent accounts
- `photo_url` (text, nullable)

## Belt Ranks (Kyu System)

- White (10th Kyu)
- Yellow (9th Kyu)
- Orange (8th Kyu)
- Orange & Blue Stripe (7th Kyu)
- Blue (6th Kyu)
- Blue & Yellow Stripe (5th Kyu)
- Purple (4th Kyu)
- Purple & Yellow Stripe (3rd Kyu)
- Brown (2nd Kyu)
- Brown & Yellow Stripe (1st Kyu)

## Achievement Levels

- School
- Provincial
- National
- International

## Attendance Status

- present
- late
- absent

## User Roles

- admin - Full access
- coach - Can manage students, attendance, achievements
- parent - View only their linked student
