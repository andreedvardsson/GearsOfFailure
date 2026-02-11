import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_SIZE = 5_000_000; // 5 MB
const MAX_SIZE = 20_000_000; // 20 MB
const MIN_SIZE = 500_000; // 0.5 MB

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = Number(searchParams.get('size'));
  const size = Math.min(Math.max(Number.isFinite(sizeParam) ? sizeParam : DEFAULT_SIZE, MIN_SIZE), MAX_SIZE);

  const buffer = randomBytes(size);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
