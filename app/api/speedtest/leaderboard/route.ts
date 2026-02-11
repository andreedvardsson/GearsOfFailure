import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { SpeedtestResult } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_NAME_LENGTH = 40;
const MIN_SPEED = 0.1; // Mbps
const MAX_SPEED = 10000; // Mbps

// GET - fetch leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 100);

    const db = await getDatabase();
    const collection = db.collection<SpeedtestResult>('speedtest_results');

    const results = await collection
      .find({})
      .sort({ speedMbps: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching speedtest leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - submit result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const speedMbps = Number(body?.speedMbps);

    if (!name || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (!Number.isFinite(speedMbps) || speedMbps < MIN_SPEED || speedMbps > MAX_SPEED) {
      return NextResponse.json({ error: 'Invalid speed' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<SpeedtestResult>('speedtest_results');

    const newResult: Omit<SpeedtestResult, '_id'> = {
      name,
      speedMbps: Number(speedMbps.toFixed(2)),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newResult as SpeedtestResult);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error saving speedtest result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
