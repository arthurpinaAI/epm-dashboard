import { NextResponse } from 'next/server';
import { runSync, getSyncStatus, type SyncMode } from '@/lib/zoho-sync';

export const dynamic    = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    const status = await getSyncStatus();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { mode = 'incremental' } = (await req.json()) as { mode?: SyncMode };
    if (mode !== 'incremental' && mode !== 'full') {
      return NextResponse.json({ error: 'mode must be incremental or full' }, { status: 400 });
    }
    const result = await runSync(mode);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
