/**
 * Application Constants
 * Centralized configuration values
 */

// Authentication
export const AUTH_CONSTANTS = {
  SESSION_COOKIE_NAME: 'session',
  SESSION_MAX_AGE: 60 * 60 * 24 * 5 * 1000, // 5 days in milliseconds
  ALLOWED_EMAIL_DOMAIN: 'chasacademy.se',
} as const;

// Database Collections
export const COLLECTIONS = {
  STUDENTS: process.env.STUDENTS_COLLECTION || 'chas_2026_students',
  USERS: 'users',
  FEEDBACK: 'feedback',
  LOGIN_HISTORY: 'loginHistory',
  WEEKS: 'weeks',
  ASSIGNMENTS: 'assignments',
} as const;

// Course Configuration
export const COURSE_CONFIG = {
  START_DATE: '2026-01-19', // Monday, Week 1
  TOTAL_WEEKS: 11,
  SCHEDULED_DAYS: {
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
  },
  // Week 1 special schedule (only Tue, Wed, Thu)
  WEEK_1_DATES: {
    TUESDAY: '2026-01-20',
    WEDNESDAY: '2026-01-21',
    THURSDAY: '2026-01-22',
  },
} as const;

// Protected Routes
export const PROTECTED_ROUTES = {
  ADMIN: ['/admin', '/students'] as string[],
  AUTHENTICATED: ['/', '/dashboard', '/teams', '/feedback', '/course', '/architecture'] as string[],
  PUBLIC: ['/login'] as string[],
};

// Default Values
export const DEFAULTS = {
  USER_ROLE: 'student',
  PAGINATION_LIMIT: 50,
} as const;
