import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await request.arrayBuffer();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling upload test:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
