import { NextRequest, NextResponse } from 'next/server';
import { createCanvasClient } from '@/lib/canvas';

// Helper to determine current week based on course start date
// Course started: Monday, January 19, 2026 (Week 1)
function getCurrentWeek(courseStartDate: Date = new Date('2026-01-19')): number {
  const now = new Date();
  const diffTime = now.getTime() - courseStartDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.ceil(diffDays / 7);
  return Math.max(1, Math.min(week, 52)); // Week 1-52
}

// Helper to extract week number from page/item title (Vecka 1, Vecka 2, etc.)
function extractWeekFromTitle(title: string): number | null {
  const match = title.match(/vecka\s*(\d+)/i) || title.match(/week\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

// GET - Fetch Canvas course materials from the Kurs 4 module
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canvas = createCanvasClient();
    const config = canvas.getConfig();

    // Check if Canvas is configured
    if (!config.apiUrl || !config.apiToken || !config.defaultCourseId) {
      return NextResponse.json({
        error: 'Canvas not configured',
        message: 'Canvas API credentials not set in environment variables',
        configured: false,
      }, { status: 503 });
    }

    // Get week parameter or use current week
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    const targetWeek = weekParam ? parseInt(weekParam, 10) : getCurrentWeek();

    // Fetch module items from the Kurs 4 module (Module ID from env: CANVAS_MODULE_ID)
    const moduleId = config.defaultModuleId;

    if (!moduleId) {
      return NextResponse.json({
        error: 'Module not configured',
        message: 'CANVAS_MODULE_ID not set in environment variables',
        configured: false,
      }, { status: 503 });
    }

    // Fetch all items from the Kurs 4 module
    const allItems = await canvas.modules.listItems(moduleId).catch(() => []);

    // Separate items into categories
    const currentWeekPages: any[] = [];
    const otherPages: any[] = [];
    const files: any[] = [];
    const general: any[] = [];

    allItems.forEach((item) => {
      if (!item.published) return; // Skip unpublished items

      const weekNum = extractWeekFromTitle(item.title);
      const itemData = {
        id: item.id,
        title: item.title,
        type: item.type,
        url: item.html_url || item.external_url,
        week: weekNum,
      };

      // Categorize items
      if (item.type === 'Page') {
        if (weekNum === targetWeek) {
          currentWeekPages.push(itemData);
        } else if (weekNum !== null) {
          otherPages.push(itemData);
        } else {
          general.push(itemData);
        }
      } else if (item.type === 'File') {
        files.push(itemData);
      } else {
        // Other types: SubHeader, ExternalUrl, Assignment, etc.
        if (weekNum === targetWeek || weekNum === null) {
          general.push(itemData);
        }
      }
    });

    // Sort by week number
    otherPages.sort((a, b) => (a.week || 999) - (b.week || 999));

    // Structure the response
    const materials = {
      week: targetWeek,
      currentWeek: {
        pages: currentWeekPages,
        files: files.filter(f => extractWeekFromTitle(f.title) === targetWeek),
        other: general,
      },
      allWeeks: otherPages,
      generalFiles: files.filter(f => extractWeekFromTitle(f.title) === null),
      configured: true,
    };

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching Canvas materials:', error);
    return NextResponse.json({
      error: 'Failed to fetch Canvas materials',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
