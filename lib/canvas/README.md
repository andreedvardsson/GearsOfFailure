# Canvas LMS SDK

Type-safe SDK for Canvas LMS API integration.

## Quick Start

```typescript
import { createCanvasClient } from '@/lib/canvas';

const canvas = createCanvasClient();

// Get current user
const user = await canvas.users.getSelf();

// List courses
const courses = await canvas.courses.list();

// Get modules in a course
const modules = await canvas.modules.list(courseId);
```

## Configuration

Set environment variables:

```env
CANVAS_API_URL=https://yourschool.instructure.com
CANVAS_API_TOKEN=your_api_token
CANVAS_COURSE_ID=123        # Optional default
CANVAS_MODULE_ID=456        # Optional default
```

## API Namespaces

### Users
```typescript
canvas.users.getSelf()              // Get authenticated user
```

### Courses
```typescript
canvas.courses.list()               // List all courses
canvas.courses.get(courseId?)       // Get specific course
canvas.courses.listStudents(courseId?)  // List enrolled students
```

### Modules
```typescript
canvas.modules.list(courseId?)                    // List modules
canvas.modules.get(moduleId?, courseId?)          // Get module
canvas.modules.listItems(moduleId?, courseId?)    // List module items
canvas.modules.addItem(item, moduleId?, courseId?)    // Add item
canvas.modules.deleteItem(itemId, moduleId?, courseId?)  // Delete item
```

### Pages
```typescript
canvas.pages.list(courseId?)                      // List pages
canvas.pages.get(pageUrl, courseId?)              // Get page by URL
canvas.pages.create(page, courseId?)              // Create page
canvas.pages.update(pageUrl, page, courseId?)     // Update page
canvas.pages.delete(pageUrl, courseId?)           // Delete page
```

### Assignments
```typescript
canvas.assignments.list(courseId?)                    // List assignments
canvas.assignments.get(assignmentId, courseId?)       // Get assignment
canvas.assignments.create(assignment, courseId?)      // Create assignment
canvas.assignments.update(assignmentId, assignment, courseId?)  // Update
canvas.assignments.delete(assignmentId, courseId?)    // Delete
```

### Submissions
```typescript
canvas.submissions.list(assignmentId, courseId?)      // List submissions
canvas.submissions.get(assignmentId, userId, courseId?)   // Get submission
canvas.submissions.grade(assignmentId, userId, grade, courseId?)  // Grade
```

## High-Level Sync

Sync platform content directly to Canvas. **Updates existing pages in place** (no duplicates).

```typescript
import { syncWeekToCanvas, syncAssignmentToCanvas } from '@/lib/canvas';

// Sync a week - creates if new, updates if exists
const result = await syncWeekToCanvas(weekData, {
  courseId: 583,
  moduleId: 1994,
  publish: true
});

// Sync an assignment
const result = await syncAssignmentToCanvas(assignmentData, {
  courseId: 583,
  moduleId: 1994,
  publish: false
});
```

### How Sync Works

1. **Page sync**: Searches for existing page by URL pattern (`vecka-{n}*`)
2. **If found**: Updates the existing page in place
3. **If not found**: Creates a new page
4. **Module items**: Only added if not already present

### Sync Result

```typescript
interface SyncResult {
  success: boolean;
  created: string[];   // Items created
  updated: string[];   // Items updated
  errors: Array<{ item: string; error: string }>;
}
```

## Types

All Canvas types are exported:

```typescript
import type {
  CanvasUser,
  CanvasCourse,
  CanvasModule,
  CanvasModuleItem,
  CanvasPage,
  CanvasAssignment,
  CanvasSubmission,
  CanvasStudent,
} from '@/lib/canvas';
```

## Error Handling

```typescript
try {
  const course = await canvas.courses.get(999);
} catch (error) {
  // Error message: "Canvas API Error: The specified resource does not exist"
}
```

## Default IDs

If `CANVAS_COURSE_ID` and `CANVAS_MODULE_ID` are set, you can omit them:

```typescript
// Uses default course ID from env
const modules = await canvas.modules.list();

// Uses default module ID from env
const items = await canvas.modules.listItems();
```
