// Core domain entities — mirror the Postgres schema (see supabase/migrations).

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Student {
  id: string;
  full_name: string;
  name?: string;
  belt: string;
  grade?: string;
  dob?: string;
  admission_id?: string;
  parent_phone?: string;
  parent_email?: string;
  photo_url?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string; // ISO yyyy-mm-dd (Asia/Colombo)
  status: AttendanceStatus;
  session_id?: string | null;
  marked_by?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export type Placement = 'Gold' | 'Silver' | 'Bronze' | 'Best 8' | 'Participant';
export type AchievementLevel = 'School' | 'Zonal' | 'Provincial' | 'National' | 'International';

export interface Achievement {
  id: string;
  student_id: string;
  tournament_id?: string | null;
  event_id?: string | null;
  title: string;
  level: string;
  placement: string;
  date: string;
  notes?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface TournamentSeries {
  id: string;
  name: string;
  level?: string;
  [key: string]: unknown;
}

export interface Tournament {
  id: string;
  series_id?: string | null;
  name: string;
  level?: string;
  date?: string | null;
  location?: string | null;
  [key: string]: unknown;
}

export interface TournamentEvent {
  id: string;
  tournament_id: string;
  name: string;
  category: 'individual' | 'team';
  team_size?: number | null;
  dates?: string[];
  [key: string]: unknown;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  [key: string]: unknown;
}

export interface Session {
  id: string;
  title: string;
  time: string; // "HH:MM"
  days: number[]; // 0=Sunday..6=Saturday
  [key: string]: unknown;
}

export type ProfileRole = 'coach' | 'parent';

export interface Profile {
  id: string;
  full_name?: string;
  role: ProfileRole;
  student_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  [key: string]: unknown;
}

export interface ClubSettings {
  id: number;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AppUser {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
}

export interface AppSession {
  user: AppUser;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface AttendanceBreakdown {
  total: number;
  present: number;
  late: number;
  absent: number;
  rate: number; // present + late*0.5 over total, rounded to 1 decimal, percent
}

export interface AttendanceSummary extends AttendanceBreakdown {
  presentPct: number;
  presentOnlyPct: number;
  absentPct: number;
  latePct: number;
}

export interface MedalCounts {
  Gold: number;
  Silver: number;
  Bronze: number;
}

export interface TrendDatum {
  label: string;
  rate: number;
  total: number;
  [key: string]: unknown;
}

export interface ImportResult {
  valid: Student[];
  skipped: { row: number; reason: string }[];
}

export interface NotificationsItem {
  id: string;
  type: string;
  icon: unknown;
  tint: string;
  text: string;
  date: string;
}
