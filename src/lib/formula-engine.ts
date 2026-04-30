import { PrismaClient } from '@prisma/client';
import type { FormulaBlock } from '@/types';

// Field → table mapping for SQL generation
const FIELD_TABLE: Record<string, { table: string; column: string }> = {
  registration_status:  { table: 'registrations', column: 'registration_status' },
  registration_date:    { table: 'registrations', column: 'registration_date' },
  ticket_type:          { table: 'registrations', column: 'ticket_type' },
  event_year:           { table: 'registrations', column: 'event_year' },
  booking_date:         { table: 'bookings', column: 'booking_date' },
  booking_status:       { table: 'bookings', column: 'booking_status' },
  payment_amount:       { table: 'payments', column: 'payment_amount' },
  payment_status:       { table: 'payments', column: 'payment_status' },
  payment_date:         { table: 'payments', column: 'payment_date' },
  speaker_status:       { table: 'speakers', column: 'speaker_status' },
  speaker_fee_type:     { table: 'speakers', column: 'speaker_fee_type' },
  speaker_grade:        { table: 'speakers', column: 'speaker_grade' },
  sponsor_tier:         { table: 'sponsors', column: 'sponsor_tier' },
  sponsor_status:       { table: 'sponsors', column: 'sponsor_status' },
  marketing_reply_date: { table: 'marketing_activities', column: 'marketing_reply_date' },
  marketing_channel:    { table: 'marketing_activities', column: 'marketing_channel' },
  spf_score:            { table: 'marketing_activities', column: 'spf_score' },
  tm_call_result:       { table: 'telemarketing_calls', column: 'tm_call_result' },
  tm_call_date:         { table: 'telemarketing_calls', column: 'tm_call_date' },
};

// Parse a condition string like "= Active", "> 0", "≠ Cancelled"
function parseCondition(field: string, cond: string): string | null {
  const tableInfo = FIELD_TABLE[field];
  if (!tableInfo) return null;
  const col = `${tableInfo.column}`;

  const m = cond.match(/^(=|≠|!=|>|<|>=|≥|<=|≤)\s*(.+)$/);
  if (!m) return null;
  const [, op, val] = m;
  const sqlOp = op === '≠' ? '!=' : op === '≥' ? '>=' : op === '≤' ? '<=' : op;

  const numericFields = ['payment_amount', 'spf_score', 'event_year'];
  if (numericFields.includes(field) || !isNaN(Number(val))) {
    return `${col} ${sqlOp} ${val}`;
  }

  if (val.includes('TODAY()')) {
    const dayMatch = val.match(/TODAY\(\)\s*[−-]\s*(\d+)/);
    if (dayMatch) {
      return `${col} ${sqlOp} NOW() - INTERVAL '${dayMatch[1]} days'`;
    }
    return `${col} ${sqlOp} NOW()`;
  }

  return `${col} ${sqlOp} '${val}'`;
}

// Build COUNT WHERE query for a block sequence
function buildCountWhereQuery(blocks: FormulaBlock[], eventCode?: string): string | null {
  let fieldIdx = -1;
  let opIdx = -1;

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].t === 'field' && fieldIdx === -1) fieldIdx = i;
    if (blocks[i].t === 'op' && opIdx === -1) opIdx = i;
  }

  if (fieldIdx === -1 || opIdx === -1) return null;

  const field = blocks[fieldIdx].v;
  const tableInfo = FIELD_TABLE[field];
  if (!tableInfo) return null;

  const { table } = tableInfo;
  const whereConditions: string[] = [];

  if (eventCode) {
    whereConditions.push(`event_code = '${eventCode}'`);
  }

  // Parse conditions after the op
  let i = opIdx + 1;
  let currentField = field;

  while (i < blocks.length) {
    const block = blocks[i];
    if (block.t === 'logic') {
      whereConditions.push(block.v.toUpperCase());
      i++;
      continue;
    }
    if (block.t === 'cond') {
      const cond = parseCondition(currentField, block.v);
      if (cond) whereConditions.push(cond);
      i++;
      continue;
    }
    if (block.t === 'field') {
      currentField = block.v;
      i++;
      continue;
    }
    if (block.t === 'cmp') {
      if (i + 1 < blocks.length && blocks[i + 1].t === 'val') {
        const cond = parseCondition(currentField, `${block.v} ${blocks[i + 1].v}`);
        if (cond) whereConditions.push(cond);
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    i++;
  }

  const where = whereConditions.length ? `WHERE ${whereConditions.join(' ')}` : '';
  return `SELECT event_code, COUNT(*) as value FROM ${table} ${where} GROUP BY event_code`;
}

function buildSumWhereQuery(blocks: FormulaBlock[], eventCode?: string): string | null {
  const fieldBlock = blocks.find((b) => b.t === 'field');
  if (!fieldBlock) return null;

  const field = fieldBlock.v;
  const tableInfo = FIELD_TABLE[field];
  if (!tableInfo) return null;

  const { table, column } = tableInfo;
  const whereConditions: string[] = [];
  if (eventCode) whereConditions.push(`event_code = '${eventCode}'`);

  const where = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
  return `SELECT event_code, SUM(${column}) as value FROM ${table} ${where} GROUP BY event_code`;
}

// Execute a formula against the database for all events, returning event_code → value map
export async function computeFormulaAllEvents(
  blocks: FormulaBlock[],
  prisma: PrismaClient,
): Promise<Record<string, number>> {
  const op = blocks.find((b) => b.t === 'op')?.v;

  let query: string | null = null;

  if (op === 'COUNT WHERE') {
    query = buildCountWhereQuery(blocks);
  } else if (op === 'SUM WHERE') {
    query = buildSumWhereQuery(blocks);
  }

  if (!query) return {};

  try {
    const rows = await prisma.$queryRawUnsafe<{ event_code: string; value: bigint | string }[]>(query);
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.event_code] = Number(row.value);
    }
    return result;
  } catch {
    return {};
  }
}

// Velocity queries: count rows in time windows
export async function computeVelocity(
  table: 'bookings' | 'payments' | 'marketing_activities' | 'telemarketing_calls',
  dateColumn: string,
  eventCode: string,
  prisma: PrismaClient,
): Promise<{ today: number; yesterday: number; d7: number; d14: number; d21: number }> {
  const base = `FROM ${table} WHERE event_code = '${eventCode}'`;

  const queries = [
    `SELECT COUNT(*) as n ${base} AND ${dateColumn} >= NOW() - INTERVAL '1 day' AND ${dateColumn} < NOW()`,
    `SELECT COUNT(*) as n ${base} AND ${dateColumn} >= NOW() - INTERVAL '2 days' AND ${dateColumn} < NOW() - INTERVAL '1 day'`,
    `SELECT COUNT(*) as n ${base} AND ${dateColumn} >= NOW() - INTERVAL '7 days'`,
    `SELECT COUNT(*) as n ${base} AND ${dateColumn} >= NOW() - INTERVAL '14 days' AND ${dateColumn} < NOW() - INTERVAL '7 days'`,
    `SELECT COUNT(*) as n ${base} AND ${dateColumn} >= NOW() - INTERVAL '21 days' AND ${dateColumn} < NOW() - INTERVAL '14 days'`,
  ];

  try {
    const results = await Promise.all(
      queries.map((q) => prisma.$queryRawUnsafe<{ n: bigint }[]>(q)),
    );
    return {
      today:     Number(results[0][0]?.n ?? 0),
      yesterday: Number(results[1][0]?.n ?? 0),
      d7:        Number(results[2][0]?.n ?? 0),
      d14:       Number(results[3][0]?.n ?? 0),
      d21:       Number(results[4][0]?.n ?? 0),
    };
  } catch {
    return { today: 0, yesterday: 0, d7: 0, d14: 0, d21: 0 };
  }
}
