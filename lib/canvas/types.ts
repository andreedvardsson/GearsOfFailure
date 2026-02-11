/**
 * Canvas LMS API Types
 *
 * Type definitions for Canvas LMS API responses and requests.
 * Based on Canvas REST API documentation.
 *
 * @see https://canvas.instructure.com/doc/api/
 */

// ============================================
// USER TYPES
// ============================================

export interface CanvasUser {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
  login_id?: string;
  email?: string;
  avatar_url?: string;
  locale?: string;
  effective_locale?: string;
  created_at: string;
}

// ============================================
// COURSE TYPES
// ============================================

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  account_id: number;
  uuid: string;
  start_at?: string;
  end_at?: string;
  workflow_state: 'unpublished' | 'available' | 'completed' | 'deleted';
  default_view: 'feed' | 'wiki' | 'modules' | 'assignments' | 'syllabus';
  enrollment_term_id: number;
  enrollments?: CanvasEnrollment[];
  time_zone: string;
  is_public: boolean;
  public_syllabus: boolean;
  storage_quota_mb: number;
}

export interface CanvasEnrollment {
  type: 'teacher' | 'student' | 'ta' | 'observer' | 'designer';
  role: string;
  role_id: number;
  user_id: number;
  enrollment_state: 'active' | 'invited' | 'inactive';
  limit_privileges_to_course_section: boolean;
}

// ============================================
// MODULE TYPES
// ============================================

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  unlock_at?: string;
  require_sequential_progress: boolean;
  publish_final_grade: boolean;
  prerequisite_module_ids: number[];
  published: boolean;
  items_count: number;
  items_url: string;
  items?: CanvasModuleItem[];
  state?: 'locked' | 'unlocked' | 'started' | 'completed';
}

export interface CanvasModuleItem {
  id: number;
  module_id: number;
  position: number;
  title: string;
  indent: number;
  type: 'File' | 'Page' | 'Discussion' | 'Assignment' | 'Quiz' | 'SubHeader' | 'ExternalUrl' | 'ExternalTool';
  content_id?: number;
  html_url: string;
  url?: string;
  page_url?: string;
  external_url?: string;
  new_tab?: boolean;
  published: boolean;
  unpublishable: boolean;
}

export interface CreateModuleItemRequest {
  module_item: {
    title: string;
    type: CanvasModuleItem['type'];
    content_id?: number;
    page_url?: string;
    external_url?: string;
    new_tab?: boolean;
    indent?: number;
    position?: number;
  };
}

// ============================================
// PAGE TYPES
// ============================================

export interface CanvasPage {
  url: string;
  title: string;
  created_at: string;
  updated_at: string;
  editing_roles: string;
  page_id: number;
  published: boolean;
  hide_from_students: boolean;
  front_page: boolean;
  html_url: string;
  body?: string;
  last_edited_by?: {
    id: number;
    display_name: string;
    avatar_image_url: string;
    html_url: string;
  };
}

export interface CreatePageRequest {
  wiki_page: {
    title: string;
    body: string;
    url?: string;
    editing_roles?: 'teachers' | 'students' | 'members' | 'public';
    notify_of_update?: boolean;
    published?: boolean;
    front_page?: boolean;
  };
}

// ============================================
// ASSIGNMENT TYPES
// ============================================

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  due_at?: string;
  lock_at?: string;
  unlock_at?: string;
  course_id: number;
  html_url: string;
  submissions_download_url: string;
  assignment_group_id: number;
  points_possible: number;
  grading_type: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points' | 'not_graded';
  submission_types: Array<
    | 'online_quiz'
    | 'none'
    | 'on_paper'
    | 'discussion_topic'
    | 'external_tool'
    | 'online_upload'
    | 'online_text_entry'
    | 'online_url'
    | 'media_recording'
    | 'student_annotation'
  >;
  has_submitted_submissions: boolean;
  workflow_state: 'published' | 'unpublished' | 'deleted';
  published: boolean;
  unpublishable: boolean;
  position: number;
  peer_reviews: boolean;
  anonymous_peer_reviews: boolean;
  moderated_grading: boolean;
  omit_from_final_grade: boolean;
  muted: boolean;
  needs_grading_count?: number;
}

export interface CreateAssignmentRequest {
  assignment: {
    name: string;
    description?: string;
    submission_types?: CanvasAssignment['submission_types'];
    allowed_extensions?: string[];
    due_at?: string;
    lock_at?: string;
    unlock_at?: string;
    points_possible?: number;
    grading_type?: CanvasAssignment['grading_type'];
    assignment_group_id?: number;
    peer_reviews?: boolean;
    published?: boolean;
    position?: number;
    omit_from_final_grade?: boolean;
    only_visible_to_overrides?: boolean;
  };
}

// ============================================
// SUBMISSION TYPES
// ============================================

export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at?: string;
  graded_at?: string;
  score?: number;
  grade?: string;
  attempt?: number;
  workflow_state: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  late: boolean;
  missing: boolean;
  excused: boolean;
  body?: string;
  url?: string;
  preview_url: string;
  submission_type?: string;
  submission_comments?: CanvasSubmissionComment[];
}

export interface CanvasSubmissionComment {
  id: number;
  author_id: number;
  author_name: string;
  comment: string;
  created_at: string;
  edited_at?: string;
}

export interface GradeSubmissionRequest {
  submission: {
    posted_grade: string;
  };
  comment?: {
    text_comment: string;
  };
}

// ============================================
// ENROLLMENT / STUDENT TYPES
// ============================================

export interface CanvasStudent {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
  login_id?: string;
  email?: string;
  avatar_url?: string;
  enrollments?: CanvasEnrollment[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface CanvasApiError {
  errors: Array<{
    message: string;
    error_code?: string;
  }>;
  status: string;
}

export interface CanvasPaginatedResponse<T> {
  data: T[];
  link?: {
    current?: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}
