import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyAdmin } from '@/lib/auth/admin-helpers';
import { LoginEvent } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin();
    if (!adminAuth.success) {
      const status = adminAuth.error?.includes('Unauthorized') ? 401 : 403;
      return NextResponse.json({ error: adminAuth.error }, { status });
    }

    const db = await getDatabase();

    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const success = searchParams.get('success');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter query
    const filter: Record<string, unknown> = {};
    if (email) {
      filter.email = { $regex: email, $options: 'i' }; // Case-insensitive search
    }
    if (success !== null && success !== undefined && success !== '') {
      filter.success = success === 'true';
    }
    if (startDate || endDate) {
      const timestampFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) {
        timestampFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        timestampFilter.$lte = new Date(endDate);
      }
      filter.timestamp = timestampFilter;
    }

    // Fetch login history with pagination
    const loginHistory = await db
      .collection<LoginEvent>('loginHistory')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await db.collection<LoginEvent>('loginHistory').countDocuments(filter);

    return NextResponse.json({
      events: loginHistory.map((event) => ({
        ...event,
        _id: event._id?.toString(),
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}
