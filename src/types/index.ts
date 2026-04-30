export interface FormulaBlock {
  t: 'field' | 'op' | 'cond' | 'logic' | 'cmp' | 'math' | 'val' | 'ref' | 'paren';
  v: string;
}

export interface RedFlag {
  id: string;
  name: string;
  sev: 'critical' | 'high' | 'medium' | 'low';
  thresh: string;
  cur: string;
}

export interface VelocityData {
  today: number;
  yesterday: number;
  d7: number;
  d14: number;
  d21: number;
}

export interface SpeakerMetrics {
  booked: number;
  paid: number;
  free: number;
  confirmed: number;
  shortage: number;
  standby: number;
  grading: number;
  proposals: number;
  interested: number;
}

export interface MarketingMetrics {
  all: number;
  spf: number;
  d7: number;
  d14: number;
  d21: number;
}

export interface TelemarketingMetrics {
  called: number;
  lhf0: number;
  blue: number;
  agenda: number;
}

export type Recommendation =
  | 'GO'
  | 'GO — BENCHMARK CROSSED'
  | 'WATCH'
  | 'ESCALATE'
  | 'CRITICAL'
  | 'POSTPONED';

export interface EventSummary {
  id: string;
  code: string;
  rep: string;
  weeksOut: number;
  status: string;
  rec: Recommendation;
  flagCount: number;
  live25: number;
  live24: number;
  expected: number;
  final24: number;
  paid: number;
  free: number;
  pending: number;
  cancelled: number;
  spex: number;
  plt: number;
  gld: number;
  slv: number;
  bench: string;
  proj33: number;
}

export interface EventDetail extends EventSummary {
  flags: RedFlag[];
  bookings: VelocityData;
  payments: VelocityData;
  speakers: SpeakerMetrics;
  marketing: MarketingMetrics;
  tm: TelemarketingMetrics;
}

export interface RuleRow {
  id: string;
  name: string;
  description: string;
  severity: string;
  thresholdValue: number | null;
  gateWeeks: number | null;
  isPercent: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface FormulaRow {
  id: string;
  name: string;
  outputKey: string;
  description: string;
  blocks: FormulaBlock[];
  sortOrder: number;
}

export interface TierRow {
  level: string;
  flagCount: number;
  description: string;
}

export interface DropdownRow {
  id: number;
  category: string;
  value: string;
  sortOrder: number;
}

export interface SyncLogRow {
  id:            number;
  syncType:      string;
  status:        string;
  recordsSynced: number;
  durationMs:    number | null;
  error:         string | null;
  startedAt:     Date;
  completedAt:   Date | null;
}

export interface SyncStatusInfo {
  logs:         SyncLogRow[];
  lastSyncTime: string | null;
  rawCount:     number;
}
