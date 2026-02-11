import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IndividualSubmission, Student } from '@/lib/types';

// GET - Get student's own submissions
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection<Student>(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    const student = await collection.findOne({ email });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      submissions: student.individualSubmissions || [],
      studentName: student.name,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit new individual progress
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, workDone, blockers, nextSteps, status, week } = body;

    // Validate required fields
    if (!title || !workDone || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const submission: IndividualSubmission = {
      submissionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      week,
      date: new Date().toISOString().split('T')[0],
      title,
      workDone: Array.isArray(workDone) ? workDone : [workDone],
      blockers: Array.isArray(blockers) ? blockers : (blockers ? [blockers] : []),
      nextSteps: Array.isArray(nextSteps) ? nextSteps : (nextSteps ? [nextSteps] : []),
      status,
      submittedAt: new Date(),
    };

    const db = await getDatabase();
    const collection = db.collection<Student>(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    const result = await collection.updateOne(
      { email },
      {
        $push: { individualSubmissions: submission },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error submitting progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
