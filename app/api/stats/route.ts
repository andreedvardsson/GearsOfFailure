import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Student } from '@/lib/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection<Student>(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    // Get all students
    const students = await collection.find({}).toArray();

    // Total teams in the course (always 8 for ITSX25 2026)
    const totalTeams = 8;

    // Count total students
    const totalStudents = students.length;

    return NextResponse.json({
      teams: totalTeams,
      students: totalStudents,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return fallback values on error
    return NextResponse.json({
      teams: 8,
      students: 45,
    });
  }
}
