// Design tokens — matches the prototype's T object exactly
export const T = {
  bg: '#f7f8fa',
  bgCard: '#ffffff',
  bgHover: '#f2f3f7',
  bgSubtle: '#edeef2',
  bgInset: '#f4f5f8',

  border: '#e4e5eb',
  borderLight: '#ededf0',
  borderHover: '#d0d1d8',

  shadow1: '0 1px 2px rgba(0,0,0,0.04)',
  shadow2: '0 2px 8px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.08)',
  shadow3: '0 8px 30px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.1)',

  text: '#111318',
  textMid: '#555a66',
  textDim: '#888d9b',
  textFaint: '#b4b8c4',

  accent: '#5046e4',
  accentLight: '#6e66ea',
  accentBg: '#5046e406',
  accentBorder: '#5046e416',

  go: '#16815a',
  goBg: '#edf7f2',
  watch: '#a16c07',
  watchBg: '#fdf6e3',
  escalate: '#c05621',
  escalateBg: '#fdf0e8',
  critical: '#b91c3a',
  criticalBg: '#fde8ec',
  postponed: '#71757e',
  postponedBg: '#f0f0f2',

  sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", monospace',
  serif: '"Fraunces", Georgia, serif',
} as const;

export const REC_MAP: Record<string, { color: string; bg: string; label: string }> = {
  'GO':                     { color: T.go, bg: T.goBg, label: 'GO' },
  'GO — BENCHMARK CROSSED': { color: T.go, bg: T.goBg, label: 'GO ✓' },
  'WATCH':                  { color: T.watch, bg: T.watchBg, label: 'WATCH' },
  'ESCALATE':               { color: T.escalate, bg: T.escalateBg, label: 'ESCALATE' },
  'CRITICAL':               { color: T.critical, bg: T.criticalBg, label: 'CRITICAL' },
  'POSTPONED':              { color: T.postponed, bg: T.postponedBg, label: 'POSTPONED' },
};

export const REC_ORDER = ['CRITICAL', 'ESCALATE', 'WATCH', 'POSTPONED', 'GO', 'GO — BENCHMARK CROSSED'];

export const STATUS_MAP: Record<string, string> = {
  'Going Ahead': T.go,
  'Standby': T.escalate,
  'Postponed': T.critical,
  'Postpone': T.critical,
  'Cancelled': T.postponed,
};

export const SEV_MAP: Record<string, string> = {
  critical: T.critical,
  high: T.escalate,
  medium: T.watch,
  low: T.go,
};

// Raw Zoho database fields — auto-populated from schema
export const ZOHO_FIELDS = [
  { key: 'registration_id', label: 'Registration ID', type: 'string', table: 'Registrations' },
  { key: 'registration_status', label: 'Registration Status', type: 'enum', table: 'Registrations', values: ['Active', 'Cancelled', 'Pending', 'Waitlist'] },
  { key: 'registration_date', label: 'Registration Date', type: 'date', table: 'Registrations' },
  { key: 'ticket_type', label: 'Ticket Type', type: 'enum', table: 'Registrations', values: ['Paid', 'Free', 'Complimentary', 'VIP', 'Speaker'] },
  { key: 'event_code', label: 'Event Code', type: 'string', table: 'Events' },
  { key: 'event_date', label: 'Event Date', type: 'date', table: 'Events' },
  { key: 'event_year', label: 'Event Year', type: 'number', table: 'Events' },
  { key: 'booking_date', label: 'Booking Date', type: 'date', table: 'Bookings' },
  { key: 'booking_status', label: 'Booking Status', type: 'enum', table: 'Bookings', values: ['Confirmed', 'Pending', 'Cancelled'] },
  { key: 'payment_amount', label: 'Payment Amount', type: 'currency', table: 'Payments' },
  { key: 'payment_status', label: 'Payment Status', type: 'enum', table: 'Payments', values: ['Paid', 'Pending', 'Refunded', 'Cancelled'] },
  { key: 'payment_date', label: 'Payment Date', type: 'date', table: 'Payments' },
  { key: 'speaker_status', label: 'Speaker Status', type: 'enum', table: 'Speakers', values: ['Confirmed', 'Pending', 'Declined', 'Standby'] },
  { key: 'speaker_fee_type', label: 'Speaker Fee Type', type: 'enum', table: 'Speakers', values: ['Paid', 'Free', 'Honorarium'] },
  { key: 'speaker_grade', label: 'Speaker Grade', type: 'enum', table: 'Speakers', values: ['A', 'B', 'C', 'Ungraded'] },
  { key: 'sponsor_tier', label: 'Sponsor Tier', type: 'enum', table: 'Sponsors', values: ['Platinum', 'Gold', 'Silver', 'Bronze'] },
  { key: 'sponsor_status', label: 'Sponsor Status', type: 'enum', table: 'Sponsors', values: ['Confirmed', 'Prospect', 'Lost'] },
  { key: 'marketing_reply_date', label: 'Reply Date', type: 'date', table: 'Marketing' },
  { key: 'marketing_channel', label: 'Channel', type: 'enum', table: 'Marketing', values: ['Email', 'LinkedIn', 'Phone', 'Event'] },
  { key: 'spf_score', label: 'Sales Pitch Factor', type: 'number', table: 'Marketing' },
  { key: 'tm_call_result', label: 'Call Result', type: 'enum', table: 'Telemarketing', values: ['Interested', 'Not Interested', 'Callback', 'No Answer'] },
  { key: 'tm_call_date', label: 'Call Date', type: 'date', table: 'Telemarketing' },
] as const;

export const FIELD_TABLES = Array.from(new Set(ZOHO_FIELDS.map((f) => f.table)));

export const TYPE_ICONS: Record<string, string> = {
  string: 'Aa',
  number: '#',
  date: '◷',
  enum: '◉',
  currency: '$',
};

export const OPERATIONS = [
  { key: 'COUNT_WHERE', label: 'COUNT WHERE', desc: 'Count rows matching condition', cat: 'aggregate' },
  { key: 'SUM_WHERE', label: 'SUM WHERE', desc: 'Sum a field where condition met', cat: 'aggregate' },
  { key: 'LOOKUP', label: 'LOOKUP', desc: 'Retrieve a value from another table', cat: 'aggregate' },
  { key: 'IF_THEN', label: 'IF / THEN', desc: 'Conditional logic', cat: 'logic' },
  { key: 'AND', label: 'AND', cat: 'logic' },
  { key: 'OR', label: 'OR', cat: 'logic' },
  { key: 'ADD', label: '+', cat: 'math' },
  { key: 'SUB', label: '−', cat: 'math' },
  { key: 'MUL', label: '×', cat: 'math' },
  { key: 'DIV', label: '÷', cat: 'math' },
  { key: 'GT', label: '>', cat: 'compare' },
  { key: 'LT', label: '<', cat: 'compare' },
  { key: 'EQ', label: '=', cat: 'compare' },
  { key: 'NEQ', label: '≠', cat: 'compare' },
  { key: 'GTE', label: '≥', cat: 'compare' },
  { key: 'TODAY', label: 'TODAY()', desc: 'Current date', cat: 'date' },
  { key: 'DAYS_BETWEEN', label: 'DAYS BETWEEN', cat: 'date' },
  { key: 'WEEKS_BETWEEN', label: 'WEEKS BETWEEN', cat: 'date' },
] as const;

export const BLOCK_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  field: { color: '#4f6df5', bg: '#4f6df508', border: '#4f6df520' },
  op:    { color: '#8b5cf6', bg: '#8b5cf608', border: '#8b5cf620' },
  cond:  { color: '#c2850c', bg: '#c2850c08', border: '#c2850c20' },
  logic: { color: '#8b5cf6', bg: '#8b5cf608', border: '#8b5cf620' },
  cmp:   { color: '#6b6560', bg: '#6b656008', border: '#6b656020' },
  math:  { color: '#6b6560', bg: '#6b656008', border: '#6b656020' },
  val:   { color: '#1a8a5c', bg: '#1a8a5c08', border: '#1a8a5c20' },
  ref:   { color: '#6d5cae', bg: '#6d5cae08', border: '#6d5cae20' },
  paren: { color: '#9e9890', bg: 'transparent', border: 'transparent' },
};

export const DEFAULT_FORMULAS = [
  {
    id: 'F001', name: 'Live Count', outputKey: 'live_count',
    description: 'Active registrations for current year',
    blocks: [
      { t: 'field', v: 'registration_status' }, { t: 'op', v: 'COUNT WHERE' },
      { t: 'cond', v: '= Active' }, { t: 'logic', v: 'AND' },
      { t: 'field', v: 'event_year' }, { t: 'cmp', v: '=' }, { t: 'val', v: '2025' },
    ],
  },
  {
    id: 'F002', name: 'Paid Delegates', outputKey: 'paid_delegates',
    description: 'Confirmed paid attendees',
    blocks: [
      { t: 'field', v: 'payment_amount' }, { t: 'op', v: 'COUNT WHERE' },
      { t: 'cond', v: '> 0' }, { t: 'logic', v: 'AND' },
      { t: 'field', v: 'payment_status' }, { t: 'cmp', v: '≠' }, { t: 'val', v: 'Cancelled' },
    ],
  },
  {
    id: 'F003', name: 'Free Attendees', outputKey: 'free_attendees',
    description: 'Complimentary registrations',
    blocks: [
      { t: 'field', v: 'ticket_type' }, { t: 'op', v: 'COUNT WHERE' },
      { t: 'cond', v: '= Free' }, { t: 'logic', v: 'AND' },
      { t: 'field', v: 'registration_status' }, { t: 'cmp', v: '=' }, { t: 'val', v: 'Active' },
    ],
  },
  {
    id: 'F004', name: 'Cancelled Count', outputKey: 'cancelled_count',
    description: 'Total cancelled bookings',
    blocks: [
      { t: 'field', v: 'payment_status' }, { t: 'op', v: 'COUNT WHERE' }, { t: 'cond', v: '= Cancelled' },
    ],
  },
  {
    id: 'F005', name: 'YoY Comparison', outputKey: 'yoy_pct',
    description: 'Year-over-year percentage change',
    blocks: [
      { t: 'ref', v: 'live_count' }, { t: 'math', v: '÷' }, { t: 'ref', v: 'live_count_ly' },
      { t: 'math', v: '×' }, { t: 'val', v: '100' }, { t: 'math', v: '−' }, { t: 'val', v: '100' },
    ],
  },
  {
    id: 'F006', name: '33% Projection', outputKey: 'proj_33',
    description: 'Conservative projection at 33% velocity',
    blocks: [
      { t: 'ref', v: 'live_count' }, { t: 'math', v: '+' }, { t: 'paren', v: '(' },
      { t: 'ref', v: 'live_count' }, { t: 'math', v: '÷' }, { t: 'ref', v: 'weeks_elapsed' },
      { t: 'paren', v: ')' }, { t: 'math', v: '×' }, { t: 'ref', v: 'weeks_remaining' },
      { t: 'math', v: '×' }, { t: 'val', v: '0.33' },
    ],
  },
  {
    id: 'F007', name: 'Cancellation Rate', outputKey: 'cancel_rate',
    description: 'Percentage of bookings cancelled',
    blocks: [
      { t: 'ref', v: 'cancelled_count' }, { t: 'math', v: '÷' }, { t: 'paren', v: '(' },
      { t: 'ref', v: 'paid_delegates' }, { t: 'math', v: '+' }, { t: 'ref', v: 'cancelled_count' },
      { t: 'paren', v: ')' }, { t: 'math', v: '×' }, { t: 'val', v: '100' },
    ],
  },
  {
    id: 'F008', name: 'Booking Velocity 7d', outputKey: 'bv_7d',
    description: 'Bookings in last 7 days',
    blocks: [
      { t: 'field', v: 'booking_date' }, { t: 'op', v: 'COUNT WHERE' }, { t: 'cond', v: '≥ TODAY() − 7' },
    ],
  },
];
