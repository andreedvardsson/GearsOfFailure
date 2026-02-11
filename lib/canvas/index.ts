/**
 * Canvas LMS SDK
 *
 * A clean, type-safe SDK for interacting with Canvas LMS API.
 *
 * @example
 * ```typescript
 * import { createCanvasClient, syncWeekToCanvas } from '@/lib/canvas';
 *
 * // Direct API access
 * const canvas = createCanvasClient();
 * const courses = await canvas.courses.list();
 *
 * // High-level sync
 * await syncWeekToCanvas(weekData);
 * ```
 */

export { CanvasClient, createCanvasClient, resetCanvasClient } from './client';

export type {
  CanvasUser,
  CanvasCourse,
  CanvasEnrollment,
  CanvasModule,
  CanvasModuleItem,
  CanvasPage,
  CanvasAssignment,
  CanvasSubmission,
  CanvasSubmissionComment,
  CanvasStudent,
  CreatePageRequest,
  CreateAssignmentRequest,
  CreateModuleItemRequest,
  GradeSubmissionRequest,
  CanvasApiError,
  CanvasPaginatedResponse,
} from './types';

export { syncWeekToCanvas, syncAssignmentToCanvas, type SyncResult } from './sync';
// export { publishMarkdownToCanvas, publishMarkdownBatch } from './publish-markdown'; // Disabled - not needed for read-only access
