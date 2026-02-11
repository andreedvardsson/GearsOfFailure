import { ObjectId } from 'mongodb';

export interface IndividualSubmission {
  submissionId: string;
  week?: number;
  date: string;
  title: string; // e.g., "Workshop 1 - Docker Basics"
  workDone: string[];
  blockers: string[];
  nextSteps: string[];
  status: 'green' | 'yellow' | 'red';
  submittedAt: Date;
}

export type AttendanceStatus =
  | 'present'        // Checked in on time
  | 'present-late'   // Checked in after window
  | 'excused'        // Reported absence
  | 'absent'         // No check-in, no excuse
  | 'not-required'   // Day off or self-study day
  | 'pending';       // Day not over yet

export interface AttendanceRecord {
  date: string;              // "2026-01-24"
  status: AttendanceStatus;
  timestamp: Date;           // When marked
  comment?: string;          // Optional note
  markedBy: 'self' | 'admin' | 'import';
  markedByEmail?: string;    // If admin marked it
}

export interface Student {
  _id?: ObjectId;
  name: string;
  email: string;
  role?: 'student' | 'admin'; // NEW: User role
  interests: string | null;
  whyCourse: string | null;
  careerGoal: string | null;
  careerTags: string[];
  experience: string;
  boilerRoom: string | null;
  homeCity: string | null;
  longCommute: boolean;
  team: number | null;
  funFact: string | null;
  dataComplete: boolean;
  dataSource: 'feedback_form' | 'placeholder_attended' | 'placeholder_noshow';
  attendedIntro: boolean;
  notes: string[];
  individualSubmissions?: IndividualSubmission[];
  attendance?: AttendanceRecord[]; // Attendance tracking
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentFilterOptions {
  location?: string;
  careerTag?: string;
  experience?: string;
  dataComplete?: boolean;
  team?: number;
  search?: string;
}

export type FeedbackType = 'bug' | 'feature';
export type FeedbackStatus = 'new' | 'in-progress' | 'resolved' | 'wont-fix';

export interface FeedbackItem {
  _id?: ObjectId;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  submittedBy: {
    name: string;
    email: string;
  };
  votes: string[]; // Array of user emails who voted
  voteCount: number;
  pageUrl?: string; // Page where bug was reported
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile (for users collection)
export interface UserProfile {
  _id?: ObjectId;
  email: string;
  name?: string;
  role: 'student' | 'admin';
  teamNumber?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Login History
export interface LoginEvent {
  _id?: ObjectId;
  email: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  method: 'password' | 'email_link';
  userId?: string;
  errorMessage?: string;
}

// Team Management
export interface TeamMember {
  name: string;
  email: string;
  role?: string;
}

export interface BoilerRoomUpdate {
  date: string;
  week: number;
  participants: string[];
  workDone: string[];
  blockers: string[];
  status: 'green' | 'yellow' | 'red';
  nextSteps?: string[];
}

export interface Achievement {
  id: string;
  name: string;
  points: number;
  earnedDate: string;
  icon: string;
}

export interface TeamScore {
  total: number;
  breakdown: {
    boilerRoomSubmissions: number;
    labCompletions: number;
    participation: number;
    codeQuality: number;
    helpingOthers: number;
  };
  achievements: Achievement[];
  rank?: number;
}

export interface Team {
  name: string;
  location: string;
  members: TeamMember[];
  warning?: string;
  latestUpdate?: BoilerRoomUpdate;
  score?: TeamScore;
}

export interface SpeedtestResult {
  _id?: ObjectId;
  name: string;
  speedMbps: number;
  createdAt: Date;
}
