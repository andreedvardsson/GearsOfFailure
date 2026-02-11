import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET - Get user profile and role
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    const student = await collection.findOne({ email });

    if (!student) {
      // User is authenticated but doesn't have a profile yet
      // This happens when they sign up but profile hasn't been created
      return NextResponse.json({
        exists: false,
        email,
        role: null,
      });
    }

    return NextResponse.json({
      exists: true,
      _id: student._id?.toString(),
      name: student.name,
      email: student.email,
      role: student.role || 'student',
      team: student.team,
      boilerRoom: student.boilerRoom,
    });
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      error: 'Internal server error',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

// POST - Create or update user profile (called after signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

    // Check if profile already exists
    const existing = await collection.findOne({ email });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        student: existing,
      });
    }

    // Create new student profile
    const newStudent = {
      email,
      name: name || email.split('@')[0], // Use email prefix as default name
      role: role || 'student',
      interests: null,
      whyCourse: null,
      careerGoal: null,
      careerTags: [],
      experience: '',
      boilerRoom: null,
      homeCity: null,
      longCommute: false,
      team: null,
      funFact: null,
      dataComplete: false,
      dataSource: 'self_signup' as const,
      attendedIntro: false,
      notes: [],
      individualSubmissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newStudent);

    return NextResponse.json({
      success: true,
      message: 'Profile created',
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
