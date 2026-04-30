import type { RedFlag, Recommendation } from '@/types';

export interface EventMetrics {
  eventCode: string;
  status: string;
  weeksOut: number;
  live25: number;
  live24: number;
  final24: number;
  expected: number;
  paid: number;
  free: number;
  pending: number;
  cancelled: number;
  spex: number;
  plt: number;
  gld: number;
  slv: number;
  bookingsD7: number;
  bookingsD14: number;
  paymentsD7: number;
  marketingD7: number;
  agendaLive: boolean;
  agendaFull: boolean;
}

export interface RuleConfig {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  thresholdValue: number | null;
  gateWeeks: number | null;
  isPercent: boolean;
  isActive: boolean;
}

export interface TierConfig {
  watch: number;
  escalate: number;
  critical: number;
}

export function evaluateFlags(metrics: EventMetrics, rules: RuleConfig[]): RedFlag[] {
  const flags: RedFlag[] = [];
  const { weeksOut, live25, live24, paid, free, pending, cancelled, spex,
          expected, bookingsD7, bookingsD14, paymentsD7, marketingD7,
          agendaLive, agendaFull } = metrics;

  const inGate = (gate: number | null) =>
    gate !== null ? weeksOut <= gate && weeksOut > 0 : true;

  const addFlag = (
    rule: RuleConfig,
    thresh: string,
    cur: string,
    condition: boolean,
  ) => {
    if (rule.isActive && condition) {
      flags.push({ id: rule.id, name: rule.name, sev: rule.severity, thresh, cur });
    }
  };

  for (const rule of rules) {
    if (!rule.isActive) continue;

    switch (rule.id) {
      case 'RF001':
        addFlag(rule, 'Published', 'Not published', !agendaLive);
        break;
      case 'RF002':
        addFlag(rule, `≥${live24}`, `${live25}`, live25 < live24);
        break;
      case 'RF003': {
        const thresh = rule.thresholdValue ?? 20;
        addFlag(rule, `≥${thresh}`, `${paid}`, paid < thresh && inGate(rule.gateWeeks));
        break;
      }
      case 'RF004': {
        const pct = rule.thresholdValue ?? 40;
        const target = Math.ceil(expected * (pct / 100));
        addFlag(rule, `≥${target}`, `${live25}`,
          expected > 0 && live25 / expected < pct / 100 && inGate(rule.gateWeeks));
        break;
      }
      case 'RF005':
        addFlag(rule, '0 empty', `${Math.max(0, 10 - (spex * 2))} slots`, !agendaFull);
        break;
      case 'RF006': {
        const thresh = rule.thresholdValue ?? 2;
        addFlag(rule, `≥${thresh}`, `${spex}`, spex < thresh && inGate(rule.gateWeeks));
        break;
      }
      case 'RF007':
        addFlag(rule, '>0', '0', bookingsD7 === 0 && inGate(rule.gateWeeks));
        break;
      case 'RF008':
        addFlag(rule, '>0', '0', paymentsD7 === 0 && inGate(rule.gateWeeks));
        break;
      case 'RF009': {
        const thresh = rule.thresholdValue ?? 10;
        addFlag(rule, `≤${thresh}`, `${pending}`, pending > thresh);
        break;
      }
      case 'RF010': {
        const pct = rule.thresholdValue ?? 20;
        const total = paid + cancelled;
        const rate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
        addFlag(rule, `<${pct}%`, `${rate}%`, rate > pct);
        break;
      }
      case 'RF011':
        addFlag(rule, '>0', '0', marketingD7 === 0 && inGate(rule.gateWeeks));
        break;
      case 'RF012': {
        const pct = rule.thresholdValue ?? 50;
        const half = Math.ceil(bookingsD14 * (pct / 100));
        addFlag(rule, `≥${half}`, `${bookingsD7}`,
          bookingsD14 > 0 && bookingsD7 < half);
        break;
      }
      case 'RF013': {
        const thresh = rule.thresholdValue ?? 30;
        addFlag(rule, `≥${thresh}`, `${paid}`, paid < thresh && inGate(rule.gateWeeks));
        break;
      }
    }
  }

  return flags;
}

export function computeRecommendation(
  status: string,
  flags: RedFlag[],
  paid: number,
  tiers: TierConfig,
): Recommendation {
  if (status === 'Postponed' || status === 'Postpone' || status === 'Cancelled') return 'POSTPONED';
  if (status === 'Standby') return 'ESCALATE';
  if (flags.length >= tiers.critical) return 'CRITICAL';
  if (flags.length >= tiers.escalate) return 'ESCALATE';
  if (flags.length >= tiers.watch) return 'WATCH';
  if (paid >= 30) return 'GO — BENCHMARK CROSSED';
  return 'GO';
}
