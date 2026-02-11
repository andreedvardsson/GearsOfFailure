import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Student, AttendanceRecord } from '@/lib/types';

// POST - Student checks in for today
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { comment } = body;

    const db = await getDatabase();
    const collection = db.collection<Student>(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    // Get today's date (YYYY-MM-DD format in Swedish time)
    const today = new Date().toLocaleDateString('sv-SE');

    // Check if student already checked in today
    const student = await collection.findOne({ email });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const existingCheckin = student.attendance?.find(a => a.date === today);

    if (existingCheckin) {
      return NextResponse.json({
        error: 'Already checked in today',
        attendance: existingCheckin
      }, { status: 400 });
    }

    // Determine if late (after 10:00 AM)
    const now = new Date();
    const hour = now.getHours();
    const isLate = hour >= 10;

    // Create attendance record
    const attendanceRecord: AttendanceRecord = {
      date: today,
      status: isLate ? 'present-late' : 'present',
      timestamp: now,
      comment: comment || undefined,
      markedBy: 'self',
    };

    // Update student with attendance record
    const result = await collection.updateOne(
      { email },
      {
        $push: { attendance: attendanceRecord },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      attendance: attendanceRecord,
      message: isLate ? 'Checked in (late)' : 'Checked in successfully'
    });
  } catch (error) {
    console.error('Error checking in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get today's check-in status
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection<Student>(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    const today = new Date().toLocaleDateString('sv-SE');
    const student = await collection.findOne({ email });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const todayAttendance = student.attendance?.find(a => a.date === today);

    return NextResponse.json({
      today: today,
      checkedIn: !!todayAttendance,
      attendance: todayAttendance || null,
      recentAttendance: student.attendance?.slice(-7) || [], // Last 7 days
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
