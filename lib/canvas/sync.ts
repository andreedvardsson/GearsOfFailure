/**
 * Canvas Sync Helpers
 *
 * High-level functions for syncing platform content to Canvas LMS.
 * Handles the translation between platform data models and Canvas API.
 */

import { createCanvasClient } from './client';
import type { CanvasPage, CanvasModuleItem, CanvasAssignment } from './types';

// ============================================
// TYPES
// ============================================

export interface SyncResult {
  success: boolean;
  created: string[];
  updated: string[];
  errors: Array<{ item: string; error: string }>;
}

interface PlatformWeek {
  weekNumber: number;
  title: string;
  description: string;
  startDate: string;
  learningTargets?: string[];
  studyMaterials?: StudyMaterial[];
  exercises?: Exercise[];
  workshopSchedule?: WorkshopDay[];
}

interface StudyMaterial {
  title: string;
  type: 'video' | 'article' | 'documentation' | 'tutorial';
  url: string;
  duration?: string;
  required: boolean;
}

interface Exercise {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  solution?: string;
}

interface WorkshopDay {
  day: string;
  activities: Array<{
    time: string;
    activity: string;
    description?: string;
  }>;
}

interface PlatformAssignment {
  _id?: string;
  title: string;
  description: string;
  weekNumber: number;
  dueDate?: string;
  points?: number;
  submissionType?: 'github' | 'text' | 'file';
  courseGoals?: string[];
}

// ============================================
// WEEK SYNC
// ============================================

/**
 * Sync a platform week to Canvas as a Page + Module Items
 *
 * Creates or updates:
 * 1. A Canvas Page with the week content
 * 2. A Module Item linking to the page
 */
export async function syncWeekToCanvas(
  week: PlatformWeek,
  options: {
    courseId?: number;
    moduleId?: number;
    publish?: boolean;
  } = {}
): Promise<SyncResult> {
  const canvas = createCanvasClient();
  const result: SyncResult = {
    success: true,
    created: [],
    updated: [],
    errors: [],
  };

  try {
    // Generate page content
    const pageBody = generateWeekPageContent(week);
    const pageTitle = `Vecka ${week.weekNumber}: ${week.title}`;

    // Search for existing page by looking through all pages
    // Canvas page URLs can have suffixes (-2, -3, etc) so we need to find by pattern
    let existingPage: CanvasPage | null = null;
    try {
      const allPages = await canvas.pages.list(options.courseId);
      // Find page that starts with vecka-{weekNumber} pattern
      const pattern = `vecka-${week.weekNumber}`;
      existingPage = allPages.find(p =>
        p.url.startsWith(pattern) &&
        (p.url === pattern || p.url.charAt(pattern.length) === '-')
      ) || null;
    } catch {
      // Failed to list pages
    }

    // Create or update page
    const pageRequest = {
      wiki_page: {
        title: pageTitle,
        body: pageBody,
        published: options.publish ?? false,
      },
    };

    let actualPageUrl: string;

    if (existingPage) {
      // Update existing page using its actual URL
      await canvas.pages.update(existingPage.url, pageRequest, options.courseId);
      result.updated.push(`Page: Vecka ${week.weekNumber}`);
      actualPageUrl = existingPage.url;
    } else {
      // Create new page - let Canvas generate the URL
      const createdPage = await canvas.pages.create(pageRequest, options.courseId);
      result.created.push(`Page: Vecka ${week.weekNumber}`);
      actualPageUrl = createdPage.url;
    }

    // Add to module if moduleId provided (only if not already there)
    if (options.moduleId) {
      try {
        // Check if module item already exists
        const moduleItems = await canvas.modules.listItems(options.moduleId, options.courseId);
        const existingItem = moduleItems.find(
          item => item.type === 'Page' && item.page_url === actualPageUrl
        );

        if (!existingItem) {
          await canvas.modules.addItem(
            {
              module_item: {
                title: pageTitle,
                type: 'Page',
                page_url: actualPageUrl,
              },
            },
            options.moduleId,
            options.courseId
          );
          result.created.push(`Module Item: Vecka ${week.weekNumber}`);
        }
        // If item exists, we don't need to do anything (page content already updated)
      } catch (error) {
        result.errors.push({
          item: `Module Item: Vecka ${week.weekNumber}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push({
      item: `Week ${week.weekNumber}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return result;
}

/**
 * Generate HTML content for a week page
 */
function generateWeekPageContent(week: PlatformWeek): string {
  const sections: string[] = [];

  // Header
  sections.push(`
    <h1>Vecka ${week.weekNumber}: ${week.title}</h1>
    <p><strong>Startdatum:</strong> ${new Date(week.startDate).toLocaleDateString('sv-SE')}</p>
    <p>${week.description}</p>
  `);

  // Learning Targets
  if (week.learningTargets && week.learningTargets.length > 0) {
    sections.push(`
      <h2>Kursmål</h2>
      <p>Efter denna vecka ska du kunna:</p>
      <ul>
        ${week.learningTargets.map((target) => `<li>${target}</li>`).join('\n')}
      </ul>
    `);
  }

  // Study Materials
  if (week.studyMaterials && week.studyMaterials.length > 0) {
    const required = week.studyMaterials.filter((m) => m.required);
    const optional = week.studyMaterials.filter((m) => !m.required);

    sections.push(`<h2>Instuderingsmaterial</h2>`);

    if (required.length > 0) {
      sections.push(`
        <h3>Obligatoriskt</h3>
        <ul>
          ${required
            .map(
              (m) =>
                `<li><a href="${m.url}" target="_blank">${m.title}</a> (${m.type}${m.duration ? `, ${m.duration}` : ''})</li>`
            )
            .join('\n')}
        </ul>
      `);
    }

    if (optional.length > 0) {
      sections.push(`
        <h3>Rekommenderat</h3>
        <ul>
          ${optional
            .map(
              (m) =>
                `<li><a href="${m.url}" target="_blank">${m.title}</a> (${m.type}${m.duration ? `, ${m.duration}` : ''})</li>`
            )
            .join('\n')}
        </ul>
      `);
    }
  }

  // Exercises
  if (week.exercises && week.exercises.length > 0) {
    sections.push(`
      <h2>Instuderingsövningar</h2>
      <p><em>Dessa övningar är icke-examinerande och hjälper dig förbereda för workshops.</em></p>
      ${week.exercises
        .map(
          (ex, i) => `
        <h3>Övning ${i + 1}: ${ex.title}</h3>
        <p><strong>Nivå:</strong> ${ex.difficulty}</p>
        <p>${ex.description}</p>
      `
        )
        .join('\n')}
    `);
  }

  // Workshop Schedule
  if (week.workshopSchedule && week.workshopSchedule.length > 0) {
    sections.push(`
      <h2>Workshopschema</h2>
      ${week.workshopSchedule
        .map(
          (day) => `
        <h3>${day.day}</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th style="padding: 8px; text-align: left;">Tid</th>
            <th style="padding: 8px; text-align: left;">Aktivitet</th>
          </tr>
          ${day.activities
            .map(
              (a) => `
            <tr>
              <td style="padding: 8px;">${a.time}</td>
              <td style="padding: 8px;">${a.activity}${a.description ? `<br><small>${a.description}</small>` : ''}</td>
            </tr>
          `
            )
            .join('\n')}
        </table>
      `
        )
        .join('\n')}
    `);
  }

  return sections.join('\n');
}

// ============================================
// ASSIGNMENT SYNC
// ============================================

/**
 * Sync a platform assignment to Canvas
 *
 * Creates or updates a Canvas Assignment
 */
export async function syncAssignmentToCanvas(
  assignment: PlatformAssignment,
  options: {
    courseId?: number;
    moduleId?: number;
    publish?: boolean;
  } = {}
): Promise<SyncResult> {
  const canvas = createCanvasClient();
  const result: SyncResult = {
    success: true,
    created: [],
    updated: [],
    errors: [],
  };

  try {
    // Build description with course goals
    let description = assignment.description;
    if (assignment.courseGoals && assignment.courseGoals.length > 0) {
      description += `\n\n<h3>Kursmål som examineras:</h3>\n<ul>${assignment.courseGoals.map((g) => `<li>${g}</li>`).join('')}</ul>`;
    }

    // Map submission type
    const submissionTypes = mapSubmissionType(assignment.submissionType);

    const assignmentRequest = {
      assignment: {
        name: assignment.title,
        description,
        submission_types: submissionTypes,
        points_possible: assignment.points ?? 0,
        due_at: assignment.dueDate,
        published: options.publish ?? false,
      },
    };

    // Create assignment
    const created = await canvas.assignments.create(
      assignmentRequest,
      options.courseId
    );
    result.created.push(`Assignment: ${assignment.title}`);

    // Add to module if moduleId provided
    if (options.moduleId && created.id) {
      try {
        await canvas.modules.addItem(
          {
            module_item: {
              title: assignment.title,
              type: 'Assignment',
              content_id: created.id,
            },
          },
          options.moduleId,
          options.courseId
        );
        result.created.push(`Module Item: ${assignment.title}`);
      } catch (error) {
        result.errors.push({
          item: `Module Item: ${assignment.title}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push({
      item: assignment.title,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return result;
}

/**
 * Map platform submission type to Canvas submission types
 */
function mapSubmissionType(
  type?: string
): Array<'online_url' | 'online_text_entry' | 'online_upload'> {
  switch (type) {
    case 'github':
      return ['online_url'];
    case 'text':
      return ['online_text_entry'];
    case 'file':
      return ['online_upload'];
    default:
      return ['online_url', 'online_text_entry'];
  }
}

// ============================================
// BULK SYNC
// ============================================

/**
 * Sync multiple weeks to Canvas
 */
export async function syncAllWeeksToCanvas(
  weeks: PlatformWeek[],
  options: {
    courseId?: number;
    moduleId?: number;
    publish?: boolean;
  } = {}
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    created: [],
    updated: [],
    errors: [],
  };

  for (const week of weeks) {
    const weekResult = await syncWeekToCanvas(week, options);
    result.created.push(...weekResult.created);
    result.updated.push(...weekResult.updated);
    result.errors.push(...weekResult.errors);
    if (!weekResult.success) {
      result.success = false;
    }
  }

  return result;
}

/**
 * Sync multiple assignments to Canvas
 */
export async function syncAllAssignmentsToCanvas(
  assignments: PlatformAssignment[],
  options: {
    courseId?: number;
    moduleId?: number;
    publish?: boolean;
  } = {}
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    created: [],
    updated: [],
    errors: [],
  };

  for (const assignment of assignments) {
    const assignmentResult = await syncAssignmentToCanvas(assignment, options);
    result.created.push(...assignmentResult.created);
    result.updated.push(...assignmentResult.updated);
    result.errors.push(...assignmentResult.errors);
    if (!assignmentResult.success) {
      result.success = false;
    }
  }

  return result;
}
