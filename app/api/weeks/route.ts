import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export interface Week {
  weekNumber: number;
  title: string;
  description: string;
  published: boolean;
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

export async function GET() {
  try {
    const db = await getDatabase();
    const weeks = await db
      .collection<Week>('weeks')
      .find({})
      .sort({ weekNumber: 1 })
      .toArray();

    // Calculate which weeks should be unlocked
    const courseStartDate = new Date('2026-01-19'); // Jan 19, 2026
    const today = new Date();

    const weeksWithStatus = weeks.map((week) => {
      const weekStartDate = new Date(week.startDate);
      const isUnlocked = weekStartDate <= today || !week.published;
      const daysSinceStart = Math.floor(
        (today.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysUntilUnlock = Math.ceil(
        (weekStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...week,
        _id: week._id?.toString(),
        isUnlocked,
        daysSinceStart,
        daysUntilUnlock: daysUntilUnlock > 0 ? daysUntilUnlock : 0,
        isCurrent: isUnlocked && daysSinceStart >= 0 && daysSinceStart < 7,
      };
    });

    return NextResponse.json({
      weeks: weeksWithStatus,
      courseStartDate: courseStartDate.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course weeks' },
      { status: 500 }
    );
  }
}
