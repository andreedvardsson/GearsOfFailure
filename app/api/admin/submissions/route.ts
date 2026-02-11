import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IndividualSubmission } from '@/lib/types';

// GET - Get all student submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    // Check if user is admin
    const user = await collection.findOne({ email });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all students with their submissions
    const students = await collection
      .find(
        { individualSubmissions: { $exists: true, $ne: [] } },
        {
          projection: {
            name: 1,
            email: 1,
            team: 1,
            individualSubmissions: 1,
          },
        }
      )
      .toArray();

    // Transform data for easier consumption
    const allSubmissions = students.flatMap((student) =>
      (student.individualSubmissions || []).map((submission: IndividualSubmission) => ({
        ...submission,
        studentName: student.name,
        studentEmail: student.email,
        studentTeam: student.team,
      }))
    );

    // Sort by submission date (newest first)
    allSubmissions.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json({
      submissions: allSubmissions,
      totalStudents: students.length,
      totalSubmissions: allSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
