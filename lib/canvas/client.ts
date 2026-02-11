/**
 * Canvas LMS API Client
 *
 * A clean, type-safe SDK for interacting with Canvas LMS API.
 * Supports courses, modules, pages, assignments, and submissions.
 *
 * @example
 * ```typescript
 * import { createCanvasClient } from '@/lib/canvas/client';
 *
 * const canvas = createCanvasClient();
 * const user = await canvas.users.getSelf();
 * const courses = await canvas.courses.list();
 * ```
 *
 * @see https://canvas.instructure.com/doc/api/
 */

import type {
  CanvasUser,
  CanvasCourse,
  CanvasModule,
  CanvasModuleItem,
  CanvasPage,
  CanvasAssignment,
  CanvasSubmission,
  CanvasStudent,
  CreatePageRequest,
  CreateAssignmentRequest,
  CreateModuleItemRequest,
  GradeSubmissionRequest,
  CanvasApiError,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

interface CanvasConfig {
  apiUrl: string;
  apiToken: string;
  defaultCourseId?: number;
  defaultModuleId?: number;
}

function getConfig(): CanvasConfig {
  const apiUrl = process.env.CANVAS_API_URL;
  const apiToken = process.env.CANVAS_API_TOKEN;
  const defaultCourseId = process.env.CANVAS_COURSE_ID
    ? parseInt(process.env.CANVAS_COURSE_ID)
    : undefined;
  const defaultModuleId = process.env.CANVAS_MODULE_ID
    ? parseInt(process.env.CANVAS_MODULE_ID)
    : undefined;

  if (!apiUrl || !apiToken) {
    throw new Error(
      'Canvas API not configured. Set CANVAS_API_URL and CANVAS_API_TOKEN environment variables.'
    );
  }

  return { apiUrl, apiToken, defaultCourseId, defaultModuleId };
}

// ============================================
// HTTP CLIENT
// ============================================

class CanvasHttpClient {
  private baseUrl: string;
  private token: string;

  constructor(config: CanvasConfig) {
    this.baseUrl = `${config.apiUrl}/api/v1`;
    this.token = config.apiToken;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      if (errorBody?.errors && Array.isArray(errorBody.errors)) {
        errorMessage = errorBody.errors.map((e: { message?: string }) => e.message || 'Unknown error').join(', ');
      } else if (errorBody?.message) {
        errorMessage = errorBody.message;
      }

      throw new Error(`Canvas API Error: ${errorMessage}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, body);
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

// ============================================
// API NAMESPACES
// ============================================

class UsersApi {
  constructor(private http: CanvasHttpClient) {}

  /**
   * Get the current authenticated user
   */
  async getSelf(): Promise<CanvasUser> {
    return this.http.get('/users/self');
  }
}

class CoursesApi {
  constructor(
    private http: CanvasHttpClient,
    private defaultCourseId?: number
  ) {}

  /**
   * List all courses for the current user
   */
  async list(): Promise<CanvasCourse[]> {
    return this.http.get('/courses');
  }

  /**
   * Get a specific course
   */
  async get(courseId?: number): Promise<CanvasCourse> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}`);
  }

  /**
   * List students enrolled in a course
   */
  async listStudents(courseId?: number): Promise<CanvasStudent[]> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}/users?enrollment_type[]=student`);
  }
}

class ModulesApi {
  constructor(
    private http: CanvasHttpClient,
    private defaultCourseId?: number,
    private defaultModuleId?: number
  ) {}

  /**
   * List all modules in a course
   */
  async list(courseId?: number): Promise<CanvasModule[]> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}/modules`);
  }

  /**
   * Get a specific module
   */
  async get(moduleId?: number, courseId?: number): Promise<CanvasModule> {
    const cid = courseId || this.defaultCourseId;
    const mid = moduleId || this.defaultModuleId;
    if (!cid) throw new Error('Course ID required');
    if (!mid) throw new Error('Module ID required');
    return this.http.get(`/courses/${cid}/modules/${mid}`);
  }

  /**
   * List items in a module
   */
  async listItems(moduleId?: number, courseId?: number): Promise<CanvasModuleItem[]> {
    const cid = courseId || this.defaultCourseId;
    const mid = moduleId || this.defaultModuleId;
    if (!cid) throw new Error('Course ID required');
    if (!mid) throw new Error('Module ID required');
    return this.http.get(`/courses/${cid}/modules/${mid}/items`);
  }

  /**
   * Add an item to a module
   */
  async addItem(
    item: CreateModuleItemRequest,
    moduleId?: number,
    courseId?: number
  ): Promise<CanvasModuleItem> {
    const cid = courseId || this.defaultCourseId;
    const mid = moduleId || this.defaultModuleId;
    if (!cid) throw new Error('Course ID required');
    if (!mid) throw new Error('Module ID required');
    return this.http.post(`/courses/${cid}/modules/${mid}/items`, item);
  }

  /**
   * Delete an item from a module
   */
  async deleteItem(
    itemId: number,
    moduleId?: number,
    courseId?: number
  ): Promise<void> {
    const cid = courseId || this.defaultCourseId;
    const mid = moduleId || this.defaultModuleId;
    if (!cid) throw new Error('Course ID required');
    if (!mid) throw new Error('Module ID required');
    await this.http.delete(`/courses/${cid}/modules/${mid}/items/${itemId}`);
  }
}

class PagesApi {
  constructor(
    private http: CanvasHttpClient,
    private defaultCourseId?: number
  ) {}

  /**
   * List all pages in a course
   */
  async list(courseId?: number): Promise<CanvasPage[]> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}/pages?per_page=100`);
  }

  /**
   * Get a specific page by URL slug
   */
  async get(pageUrl: string, courseId?: number): Promise<CanvasPage> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}/pages/${pageUrl}`);
  }

  /**
   * Create a new page
   */
  async create(page: CreatePageRequest, courseId?: number): Promise<CanvasPage> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.post(`/courses/${id}/pages`, page);
  }

  /**
   * Update an existing page
   */
  async update(
    pageUrl: string,
    page: CreatePageRequest,
    courseId?: number
  ): Promise<CanvasPage> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.put(`/courses/${id}/pages/${pageUrl}`, page);
  }

  /**
   * Delete a page
   */
  async delete(pageUrl: string, courseId?: number): Promise<void> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    await this.http.delete(`/courses/${id}/pages/${pageUrl}`);
  }
}

class AssignmentsApi {
  constructor(
    private http: CanvasHttpClient,
    private defaultCourseId?: number
  ) {}

  /**
   * List all assignments in a course
   */
  async list(courseId?: number): Promise<CanvasAssignment[]> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}/assignments`);
  }

  /**
   * Get a specific assignment
   */
  async get(assignmentId: number, courseId?: number): Promise<CanvasAssignment> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(`/courses/${id}/assignments/${assignmentId}`);
  }

  /**
   * Create a new assignment
   */
  async create(
    assignment: CreateAssignmentRequest,
    courseId?: number
  ): Promise<CanvasAssignment> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.post(`/courses/${id}/assignments`, assignment);
  }

  /**
   * Update an existing assignment
   */
  async update(
    assignmentId: number,
    assignment: CreateAssignmentRequest,
    courseId?: number
  ): Promise<CanvasAssignment> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.put(`/courses/${id}/assignments/${assignmentId}`, assignment);
  }

  /**
   * Delete an assignment
   */
  async delete(assignmentId: number, courseId?: number): Promise<void> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    await this.http.delete(`/courses/${id}/assignments/${assignmentId}`);
  }
}

class SubmissionsApi {
  constructor(
    private http: CanvasHttpClient,
    private defaultCourseId?: number
  ) {}

  /**
   * List submissions for an assignment
   */
  async list(assignmentId: number, courseId?: number): Promise<CanvasSubmission[]> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(
      `/courses/${id}/assignments/${assignmentId}/submissions?include[]=submission_comments`
    );
  }

  /**
   * Get a specific submission
   */
  async get(
    assignmentId: number,
    userId: number,
    courseId?: number
  ): Promise<CanvasSubmission> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.get(
      `/courses/${id}/assignments/${assignmentId}/submissions/${userId}`
    );
  }

  /**
   * Grade a submission
   */
  async grade(
    assignmentId: number,
    userId: number,
    grade: GradeSubmissionRequest,
    courseId?: number
  ): Promise<CanvasSubmission> {
    const id = courseId || this.defaultCourseId;
    if (!id) throw new Error('Course ID required');
    return this.http.put(
      `/courses/${id}/assignments/${assignmentId}/submissions/${userId}`,
      grade
    );
  }
}

// ============================================
// MAIN CLIENT
// ============================================

export class CanvasClient {
  public readonly users: UsersApi;
  public readonly courses: CoursesApi;
  public readonly modules: ModulesApi;
  public readonly pages: PagesApi;
  public readonly assignments: AssignmentsApi;
  public readonly submissions: SubmissionsApi;

  private config: CanvasConfig;

  constructor(config?: Partial<CanvasConfig>) {
    const defaultConfig = getConfig();
    this.config = { ...defaultConfig, ...config };

    const http = new CanvasHttpClient(this.config);

    this.users = new UsersApi(http);
    this.courses = new CoursesApi(http, this.config.defaultCourseId);
    this.modules = new ModulesApi(
      http,
      this.config.defaultCourseId,
      this.config.defaultModuleId
    );
    this.pages = new PagesApi(http, this.config.defaultCourseId);
    this.assignments = new AssignmentsApi(http, this.config.defaultCourseId);
    this.submissions = new SubmissionsApi(http, this.config.defaultCourseId);
  }

  /**
   * Get the current configuration
   */
  getConfig(): CanvasConfig {
    return { ...this.config };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

let clientInstance: CanvasClient | null = null;

/**
 * Create or get a Canvas client instance
 *
 * @example
 * ```typescript
 * const canvas = createCanvasClient();
 * const user = await canvas.users.getSelf();
 * ```
 */
export function createCanvasClient(config?: Partial<CanvasConfig>): CanvasClient {
  if (!clientInstance || config) {
    clientInstance = new CanvasClient(config);
  }
  return clientInstance;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetCanvasClient(): void {
  clientInstance = null;
}
