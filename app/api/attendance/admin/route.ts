import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Student, AttendanceRecord } from '@/lib/types';
import { isAdmin } from '@/lib/auth/admin-helpers';
import { COLLECTIONS } from '@/lib/constants';

// GET - Get all attendance data (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email');

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const db = await getDatabase();
    const collection = db.collection<Student>(COLLECTIONS.STUDENTS);

    // Get all students with attendance
    const students = await collection
      .find({})
      .project({ name: 1, email: 1, team: 1, attendance: 1 })
      .sort({ name: 1 })
      .toArray();

    // Get date range for current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekDates = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toLocaleDateString('sv-SE');
    });

    return NextResponse.json({
      students,
      weekDates,
      today: new Date().toLocaleDateString('sv-SE'),
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Mark attendance manually (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email');

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { studentEmail, date, status, comment } = body;

    if (!studentEmail || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<Student>(COLLECTIONS.STUDENTS);

    // Find student
    const student = await collection.findOne({ email: studentEmail });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if attendance already exists for this date
    const existingIndex = student.attendance?.findIndex(a => a.date === date) ?? -1;

    const attendanceRecord: AttendanceRecord = {
      date,
      status,
      timestamp: new Date(),
      comment: comment || undefined,
      markedBy: 'admin',
      markedByEmail: adminEmail,
    };

    let result;
    if (existingIndex >= 0) {
      // Update existing record
      result = await collection.updateOne(
        { email: studentEmail },
        {
          $set: {
            [`attendance.${existingIndex}`]: attendanceRecord,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Add new record
      result = await collection.updateOne(
        { email: studentEmail },
        {
          $push: { attendance: attendanceRecord },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({
      success: true,
      attendance: attendanceRecord,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
