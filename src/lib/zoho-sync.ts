import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const REPORT        = 'Event_Bookings_Report';
const MAX_PER_CALL  = 1000;
const SYNC_BUFFER_MS = 2 * 60 * 1000; // 2-minute overlap buffer
const STATE_KEY     = `LAST_SYNC_${REPORT}`;
const MONTHS_SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Auth ─────────────────────────────────────────────────────────────────

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

async function getAccessToken(): Promise<string> {
  const dc     = process.env.ZOHO_DC || 'in';
  const url    = `https://accounts.zoho.${dc}/oauth/v2/token`;
  const body   = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id:     process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
  });

  const res  = await fetch(url, { method: 'POST', body, signal: withTimeout(15_000) });
  const json = await res.json() as { access_token?: string; error?: string };
  if (!json.access_token) throw new Error(`Zoho auth failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

// ─── Date formatting (Pacific Time, Zoho format) ──────────────────────────

function formatZohoDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
  const day   = get('day').padStart(2, '0');
  const mon   = MONTHS_SHORT[parseInt(get('month')) - 1];
  const year  = get('year');
  const hour  = get('hour') === '24' ? '00' : get('hour');
  const min   = get('minute');
  const sec   = get('second');
  return `${day}-${mon}-${year} ${hour}:${min}:${sec}`;
}

function parseZohoDate(str: string): Date | null {
  // "27-Jan-2026 14:30:00" in America/Los_Angeles
  const m = str.match(/^(\d{2})-([A-Za-z]{3})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, day, mon, year, hour, min, sec] = m;
  const monthIdx = MONTHS_SHORT.indexOf(mon);
  if (monthIdx === -1) return null;
  // Approximate offset: PDT=−7, PST=−8. Use −07:00 as conservative.
  const iso = `${year}-${String(monthIdx + 1).padStart(2,'0')}-${day}T${hour}:${min}:${sec}-07:00`;
  const d   = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// ─── CSV parser (handles RFC-4180 quoted fields) ──────────────────────────

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const row: string[] = [];
    while (i < n && text[i] !== '\n' && text[i] !== '\r') {
      if (text[i] === '"') {
        i++;
        let field = '';
        while (i < n) {
          if (text[i] === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
          else if (text[i] === '"') { i++; break; }
          else { field += text[i++]; }
        }
        row.push(field);
        if (text[i] === ',') i++;
      } else {
        const start = i;
        while (i < n && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') i++;
        row.push(text.slice(start, i));
        if (text[i] === ',') i++;
      }
    }
    if (row.length > 0 && !(row.length === 1 && row[0] === '')) rows.push(row);
    if (text[i] === '\r') i++;
    if (text[i] === '\n') i++;
  }
  return rows;
}

// ─── CSV fetch (one page) ─────────────────────────────────────────────────

interface CsvPage {
  headers:    string[];
  rows:       string[][];
  nextCursor: string | null;
  more:       boolean;
}

async function fetchCsvPage(token: string, cursor?: string | null, criteria?: string | null): Promise<CsvPage> {
  const dc    = process.env.ZOHO_DC || 'in';
  const owner = process.env.CREATOR_OWNER!;
  const app   = process.env.CREATOR_APP!;

  let url = `https://www.zohoapis.${dc}/creator/v2.1/data/${encodeURIComponent(owner)}/${encodeURIComponent(app)}/report/${encodeURIComponent(REPORT)}?max_records=${MAX_PER_CALL}`;
  if (criteria) url += `&criteria=${encodeURIComponent(criteria)}`;

  const headers: Record<string, string> = {
    Authorization:   `Zoho-oauthtoken ${token}`,
    Accept:          'text/csv',
    'Accept-Encoding': 'gzip',
  };
  if (cursor) headers['record_cursor'] = cursor;

  let attempt = 0, delay = 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res  = await fetch(url, { method: 'GET', headers, signal: withTimeout(45_000) });
    const code = res.status;

    if (code === 204) return { headers: [], rows: [], nextCursor: null, more: false };

    const text = await res.text();
    if (code === 400 && text.includes('9280')) return { headers: [], rows: [], nextCursor: null, more: false };
    if (text.trim() === '')                     return { headers: [], rows: [], nextCursor: null, more: false };

    if (code >= 500 || code === 429) {
      if (++attempt > 3) throw new Error(`Zoho HTTP ${code} after retries: ${text.slice(0, 200)}`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    if (code >= 300) throw new Error(`Zoho HTTP ${code}: ${text.slice(0, 200)}`);

    const parsed = parseCsv(text);
    if (!parsed.length) return { headers: [], rows: [], nextCursor: null, more: false };

    const hdrs      = parsed[0];
    const dataRows  = parsed.slice(1);
    const nextCursor = res.headers.get('record_cursor') ?? res.headers.get('x-record-cursor') ?? null;
    const more       = !!nextCursor || dataRows.length === MAX_PER_CALL;

    return { headers: hdrs, rows: dataRows, nextCursor, more };
  }
}

// ─── Upsert records ───────────────────────────────────────────────────────

async function upsertRecords(headers: string[], rows: string[][]): Promise<number> {
  if (!rows.length) return 0;

  const idIdx  = headers.indexOf('Record ID');
  const modIdx = headers.indexOf('Modified_Time');
  if (idIdx === -1) throw new Error('Record ID column not found in Zoho CSV');

  const records = rows.map(row => {
    const data: Record<string, string> = {};
    headers.forEach((h, i) => { data[h] = row[i] ?? ''; });
    const recordId     = data['Record ID'];
    const modifiedTime = modIdx !== -1 ? parseZohoDate(data['Modified_Time'] ?? '') : null;
    return { recordId, data, modifiedTime };
  });

  const BATCH = 100;
  let count   = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map(r =>
        prisma.rawRegistration.upsert({
          where:  { recordId: r.recordId },
          update: { data: r.data as Prisma.InputJsonValue, modifiedTime: r.modifiedTime, syncedAt: new Date() },
          create: { recordId: r.recordId, data: r.data as Prisma.InputJsonValue, modifiedTime: r.modifiedTime },
        })
      )
    );
    count += batch.length;
  }
  return count;
}

// ─── Sync state ───────────────────────────────────────────────────────────

async function getLastSyncTime(): Promise<string | null> {
  const state = await prisma.syncState.findUnique({ where: { key: STATE_KEY } });
  return state?.value ?? null;
}

async function setLastSyncTime(): Promise<void> {
  const safeTime = new Date(Date.now() - SYNC_BUFFER_MS);
  const formatted = formatZohoDate(safeTime);
  await prisma.syncState.upsert({
    where:  { key: STATE_KEY },
    update: { value: formatted },
    create: { key: STATE_KEY, value: formatted },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────

export type SyncMode = 'incremental' | 'full';

export interface SyncResult {
  recordsSynced: number;
  durationMs:    number;
  error?:        string;
}

export async function runSync(mode: SyncMode): Promise<SyncResult> {
  const startedAt = Date.now();

  const log = await prisma.syncLog.create({
    data: { syncType: mode, status: 'running' },
  });

  try {
    const token = await getAccessToken();

    let lastSync = mode === 'incremental' ? await getLastSyncTime() : null;

    // If no previous sync, fall back to full pull
    if (mode === 'incremental' && !lastSync) {
      lastSync = null; // full pull
    }

    const criteria = lastSync ? `(Modified_Time > '${lastSync}')` : null;

    let headers:    string[] = [];
    let totalSynced = 0;
    let cursor:     string | null = null;

    do {
      const page = await fetchCsvPage(token, cursor, criteria);
      if (page.headers.length > 0 && headers.length === 0) headers = page.headers;
      if (page.rows.length > 0) {
        totalSynced += await upsertRecords(headers, page.rows);
      }
      cursor = page.nextCursor;
      if (!page.more) break;
    } while (cursor);

    await setLastSyncTime();

    const durationMs = Date.now() - startedAt;
    await prisma.syncLog.update({
      where: { id: log.id },
      data:  { status: 'success', recordsSynced: totalSynced, durationMs, completedAt: new Date() },
    });

    return { recordsSynced: totalSynced, durationMs };

  } catch (err) {
    const error    = err instanceof Error ? err.message : String(err);
    const durationMs = Date.now() - startedAt;
    await prisma.syncLog.update({
      where: { id: log.id },
      data:  { status: 'error', error, durationMs, completedAt: new Date() },
    });
    return { recordsSynced: 0, durationMs, error };
  }
}

export async function getSyncStatus() {
  // Mark syncs stuck in "running" for >3 minutes as timed out
  const staleThreshold = new Date(Date.now() - 3 * 60 * 1000);
  await prisma.syncLog.updateMany({
    where:  { status: 'running', startedAt: { lt: staleThreshold } },
    data:   { status: 'timeout', error: 'Function timed out', completedAt: new Date() },
  });

  const [logs, lastSyncState, rawCount] = await Promise.all([
    prisma.syncLog.findMany({ orderBy: { startedAt: 'desc' }, take: 20 }),
    prisma.syncState.findUnique({ where: { key: STATE_KEY } }),
    prisma.rawRegistration.count(),
  ]);
  return { logs, lastSyncTime: lastSyncState?.value ?? null, rawCount };
}
