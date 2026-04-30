import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic    = 'force-dynamic';
export const maxDuration = 60;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseZohoDate(str: string): Date | null {
  const m = str?.match(/^(\d{2})-([A-Za-z]{3})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, day, mon, year, hour, min, sec] = m;
  const monthIdx = MONTHS.indexOf(mon);
  if (monthIdx === -1) return null;
  const d = new Date(`${year}-${String(monthIdx + 1).padStart(2,'0')}-${day}T${hour}:${min}:${sec}-07:00`);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  // Auth
  const apiKey = process.env.INGEST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'INGEST_API_KEY not configured on server' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { records?: Record<string, string>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const records = body.records;
  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ upserted: 0, durationMs: 0 });
  }

  const startedAt = Date.now();

  // Create a sync log entry
  const log = await prisma.syncLog.create({
    data: { syncType: 'incremental', status: 'running' },
  });

  try {
    const BATCH = 100;
    let upserted = 0;

    for (let i = 0; i < records.length; i += BATCH) {
      const batch = records.slice(i, i + BATCH);
      await prisma.$transaction(
        batch
          .filter(r => r['Record ID'])
          .map(record => {
            const recordId     = record['Record ID'];
            const modifiedTime = parseZohoDate(record['Modified_Time'] ?? '');
            return prisma.rawRegistration.upsert({
              where:  { recordId },
              update: { data: record as Prisma.InputJsonValue, modifiedTime, syncedAt: new Date() },
              create: { recordId, data: record as Prisma.InputJsonValue, modifiedTime },
            });
          })
      );
      upserted += batch.filter(r => r['Record ID']).length;
    }

    // Update last sync timestamp in sync_state
    const STATE_KEY = 'LAST_SYNC_Event_Bookings_Report';
    const now = new Date(Date.now() - 2 * 60 * 1000); // 2-min buffer
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(now);
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
    const lastSyncFmt = `${get('day').padStart(2,'0')}-${MONTHS[parseInt(get('month'))-1]}-${get('year')} ${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}:${get('second')}`;

    await prisma.syncState.upsert({
      where:  { key: STATE_KEY },
      update: { value: lastSyncFmt },
      create: { key: STATE_KEY, value: lastSyncFmt },
    });

    const durationMs = Date.now() - startedAt;
    await prisma.syncLog.update({
      where: { id: log.id },
      data:  { status: 'success', recordsSynced: upserted, durationMs, completedAt: new Date() },
    });

    return NextResponse.json({ upserted, durationMs });

  } catch (err) {
    const error    = err instanceof Error ? err.message : String(err);
    const durationMs = Date.now() - startedAt;
    await prisma.syncLog.update({
      where: { id: log.id },
      data:  { status: 'error', error, durationMs, completedAt: new Date() },
    });
    return NextResponse.json({ error }, { status: 500 });
  }
}
