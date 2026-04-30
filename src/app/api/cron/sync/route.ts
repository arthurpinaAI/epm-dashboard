import { NextResponse } from 'next/server';
import { runSync } from '@/lib/zoho-sync';

export const dynamic    = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runSync('incremental');
  return NextResponse.json(result);
}
