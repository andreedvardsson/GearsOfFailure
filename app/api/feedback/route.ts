import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackItem } from '@/lib/types';
import { isAdmin } from '@/lib/auth/admin-helpers';

// GET - Fetch all feedback items
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection<FeedbackItem>('feedback');

    // Fetch all feedback, sorted by votes (descending) then date (descending)
    const feedback = await collection
      .find({})
      .sort({ voteCount: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name') || userEmail?.split('@')[0] || 'Anonymous';

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description, pageUrl } = body;

    if (!type || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['bug', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<FeedbackItem>('feedback');

    const newFeedback: Omit<FeedbackItem, '_id'> = {
      type,
      title: title.trim().substring(0, 200),
      description: description.trim().substring(0, 2000),
      status: 'new',
      submittedBy: {
        name: userName,
        email: userEmail,
      },
      votes: [userEmail], // Auto-vote on own submission
      voteCount: 1,
      pageUrl: pageUrl || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newFeedback as FeedbackItem);

    return NextResponse.json({
      success: true,
      feedbackId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Vote on feedback or update (admin)
export async function PATCH(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feedbackId, action, status, adminResponse } = body;

    if (!feedbackId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<FeedbackItem>('feedback');
    const { ObjectId } = require('mongodb');

    // Handle voting
    if (action === 'vote') {
      const feedback = await collection.findOne({ _id: new ObjectId(feedbackId) });
      if (!feedback) {
        return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
      }

      const hasVoted = feedback.votes.includes(userEmail);

      if (hasVoted) {
        // Remove vote
        await collection.updateOne(
          { _id: new ObjectId(feedbackId) },
          {
            $pull: { votes: userEmail },
            $inc: { voteCount: -1 },
            $set: { updatedAt: new Date() },
          }
        );
      } else {
        // Add vote
        await collection.updateOne(
          { _id: new ObjectId(feedbackId) },
          {
            $addToSet: { votes: userEmail },
            $inc: { voteCount: 1 },
            $set: { updatedAt: new Date() },
          }
        );
      }

      return NextResponse.json({ success: true, voted: !hasVoted });
    }

    // Handle admin updates (status, response)
    if (action === 'update') {
      // Verify admin access
      if (!userEmail || !(await isAdmin(userEmail))) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }

      const updateData: any = { updatedAt: new Date() };
      if (status) updateData.status = status;
      if (adminResponse !== undefined) updateData.adminResponse = adminResponse;

      await collection.updateOne(
        { _id: new ObjectId(feedbackId) },
        { $set: updateData }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
