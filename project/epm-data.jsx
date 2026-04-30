// EPM Data Layer — Mock data + utilities
const RECOMMENDATION_COLORS = {
  'GO': '#00E676',
  'GO — BENCHMARK CROSSED': '#00E676',
  'WATCH': '#FFD740',
  'ESCALATE': '#FF6E40',
  'CRITICAL': '#FF1744',
  'POSTPONED': '#FF1744',
};

const RECOMMENDATION_ORDER = ['CRITICAL', 'ESCALATE', 'WATCH', 'POSTPONED', 'GO', 'GO — BENCHMARK CROSSED'];

const STATUS_COLORS = {
  'Going Ahead': '#00E676',
  'Standby': '#FF6E40',
  'Postponed': '#FF1744',
  'Postpone': '#FF1744',
  'Cancelled': '#9E9E9E',
};

const SEVERITY_COLORS = { critical: '#FF1744', high: '#FF6E40', medium: '#FFD740', low: '#66BB6A' };

function generateMockEvents(count = 42) {
  const cities = ['DDU','SFO','LDN','TYO','SYD','BER','SIN','DXB','NYC','CHI','LAX','MIA','SEA','BOS','ATL','DAL','DEN','PHX','PHL','HOU','AMS','PAR','MIL','BCN','MUN','VIE','ZUR','OSL','CPH','HEL','WAR','PRG','BUD','LIS','DUB','EDI','MAN','BHM','GLA','BRS','LEE','CDF'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const reps = ['VV','PM','PT','JS'];
  const statuses = ['Going Ahead','Going Ahead','Going Ahead','Going Ahead','Standby','Postponed'];

  return cities.slice(0, count).map((city, i) => {
    const monthIdx = (i * 3 + 2) % 12;
    const dayNum = (i % 28) + 1;
    const weeksOut = Math.floor(Math.random() * 30) - 4;
    const expected = Math.floor(Math.random() * 300) + 80;
    const liveCount2025 = Math.floor(expected * (0.2 + Math.random() * 0.9));
    const liveCount2024 = Math.floor(expected * (0.3 + Math.random() * 0.7));
    const finalCount2024 = Math.floor(liveCount2024 * (1 + Math.random() * 0.3));
    const paidHead = Math.floor(liveCount2025 * (0.3 + Math.random() * 0.5));
    const freeAtt = Math.floor(liveCount2025 * 0.15);
    const pending = Math.floor(Math.random() * 15);
    const cancelled = Math.floor(Math.random() * 8);
    const spexPlt = Math.floor(Math.random() * 3);
    const spexGld = Math.floor(Math.random() * 5);
    const spexSlv = Math.floor(Math.random() * 6);
    const spexTotal = spexPlt + spexGld + spexSlv;
    const b7 = Math.floor(Math.random() * 20);
    const b14 = Math.floor(Math.random() * 25);
    const b21 = Math.floor(Math.random() * 18);
    const p7 = Math.floor(Math.random() * 15);
    const p14 = Math.floor(Math.random() * 18);
    const p21 = Math.floor(Math.random() * 12);
    const spkBooked = Math.floor(Math.random() * 12) + 2;
    const spkPaid = Math.floor(spkBooked * 0.6);
    const spkFree = Math.floor(Math.random() * 5);
    const spkConfirmed = spkPaid + spkFree + Math.floor(Math.random() * 3);
    const spkShortage = Math.max(0, 10 - spkConfirmed);
    const mktAll = Math.floor(Math.random() * 200) + 20;
    const mkt7 = Math.floor(Math.random() * 30);
    const mkt14 = Math.floor(Math.random() * 35);
    const mkt21 = Math.floor(Math.random() * 25);
    const tmCalled = Math.floor(Math.random() * 50);
    const eventStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const benchmarkCrossed = paidHead >= 30;

    // Calculate red flags
    const flags = [];
    if (Math.random() > 0.7) flags.push({ id: 'RF001', name: 'Agenda Not Live', severity: 'high', threshold: 'Agenda published', current: 'Not published' });
    if (liveCount2025 < liveCount2024) flags.push({ id: 'RF002', name: 'Underperforming vs LY', severity: 'medium', threshold: `≥ ${liveCount2024}`, current: `${liveCount2025}` });
    if (paidHead < 20 && weeksOut <= 12 && weeksOut > 0) flags.push({ id: 'RF003', name: 'Payments Below Minimum', severity: 'critical', threshold: '≥ 20 paid', current: `${paidHead} paid` });
    if (expected > 0 && (liveCount2025 / expected) < 0.4 && weeksOut <= 12 && weeksOut > 0) flags.push({ id: 'RF004', name: 'Delegates Below 40%', severity: 'critical', threshold: `≥ ${Math.ceil(expected * 0.4)}`, current: `${liveCount2025}` });
    if (Math.random() > 0.6) flags.push({ id: 'RF005', name: 'Agenda Not Full', severity: 'medium', threshold: 'All slots filled', current: `${Math.floor(Math.random()*4)+1} empty slots` });
    if (spexTotal < 2 && weeksOut <= 12 && weeksOut > 0) flags.push({ id: 'RF006', name: 'SpEx Below Minimum', severity: 'high', threshold: '≥ 2 SpEx', current: `${spexTotal}` });
    if (b7 === 0 && weeksOut <= 6 && weeksOut > 0) flags.push({ id: 'RF007', name: 'Zero Bookings This Week', severity: 'critical', threshold: '> 0', current: '0' });
    if (p7 === 0 && weeksOut <= 4 && weeksOut > 0) flags.push({ id: 'RF008', name: 'Zero Payments This Week', severity: 'critical', threshold: '> 0', current: '0' });
    if (pending > 10) flags.push({ id: 'RF009', name: 'High Pending Payments', severity: 'medium', threshold: '≤ 10', current: `${pending}` });
    if (cancelled / (paidHead + cancelled || 1) > 0.2) flags.push({ id: 'RF010', name: 'High Cancellation Rate', severity: 'high', threshold: '< 20%', current: `${Math.round(cancelled / (paidHead + cancelled || 1) * 100)}%` });
    if (mkt7 === 0 && weeksOut <= 8 && weeksOut > 0) flags.push({ id: 'RF011', name: 'No Marketing Activity', severity: 'medium', threshold: '> 0 replies', current: '0' });
    if (b14 > 0 && b7 < b14 * 0.5) flags.push({ id: 'RF012', name: 'Booking Velocity Declining', severity: 'medium', threshold: `≥ ${Math.ceil(b14*0.5)}`, current: `${b7}` });
    if (!benchmarkCrossed && weeksOut <= 6 && weeksOut > 0) flags.push({ id: 'RF013', name: 'Benchmark Not Crossed', severity: 'critical', threshold: '≥ 30 paid', current: `${paidHead} paid` });

    // Determine recommendation
    let recommendation = 'GO';
    if (eventStatus === 'Postponed' || eventStatus === 'Postpone') recommendation = 'POSTPONED';
    else if (eventStatus === 'Standby') recommendation = 'ESCALATE';
    else if (flags.length >= 5) recommendation = 'CRITICAL';
    else if (flags.length >= 3) recommendation = 'ESCALATE';
    else if (flags.length >= 1) recommendation = 'WATCH';
    else if (benchmarkCrossed) recommendation = 'GO — BENCHMARK CROSSED';

    return {
      id: `evt-${i}`,
      eventCode: `${months[monthIdx]}(${dayNum})/${city}`,
      marketRep: reps[i % reps.length],
      weeksOut,
      eventStatus,
      recommendation,
      redFlagCount: flags.length,
      redFlags: flags,
      liveCount2025,
      liveCount2024,
      expected2025: expected,
      finalCount2024,
      paidHeadCount: paidHead,
      freeAttendees: freeAtt,
      pendingPayments: pending,
      cancelledPayments: cancelled,
      spexTotal,
      spexPlatinum: spexPlt,
      spexGold: spexGld,
      spexSilver: spexSlv,
      paymentBenchmark: benchmarkCrossed ? 'Crossed' : `${paidHead}/30`,
      bookings: { today: Math.floor(Math.random()*5), yesterday: Math.floor(Math.random()*7), d7: b7, d14: b14, d21: b21 },
      payments: { today: Math.floor(Math.random()*4), yesterday: Math.floor(Math.random()*5), d7: p7, d14: p14, d21: p21 },
      speakers: { booked: spkBooked, paid: spkPaid, free: spkFree, confirmed: spkConfirmed, shortage: spkShortage, standby: Math.floor(Math.random()*4), gradingPending: Math.floor(Math.random()*6), proposals: Math.floor(Math.random()*10)+2, interested: Math.floor(Math.random()*15)+5 },
      marketing: { all: mktAll, spf: Math.floor(mktAll*0.3), d7: mkt7, d14: mkt14, d21: mkt21 },
      telemarketing: { called: tmCalled, lhf0: Math.floor(tmCalled*0.3), blueTicket: Math.floor(tmCalled*0.15), agendaView: Math.floor(tmCalled*0.5) },
    };
  });
}

const MOCK_EVENTS = generateMockEvents(42);

const DEFAULT_RED_FLAG_RULES = [
  { id:'RF001', name:'Agenda Not Live', description:'Agenda has not been published yet', severity:'high', thresholdValue:null, gateWeeksOut:null, enabled:true },
  { id:'RF002', name:'Underperforming vs Last Year', description:'Live count tracking below last year at same point', severity:'medium', thresholdValue:null, gateWeeksOut:null, enabled:true },
  { id:'RF003', name:'Payments Below Minimum', description:'Paid head count below threshold within gate window', severity:'critical', thresholdValue:20, gateWeeksOut:12, enabled:true },
  { id:'RF004', name:'Delegates Below 40%', description:'Live count below percentage of expected within gate', severity:'critical', thresholdValue:40, gateWeeksOut:12, enabled:true, isPercent:true },
  { id:'RF005', name:'Agenda Not Full', description:'Agenda has unfilled speaker/panel slots', severity:'medium', thresholdValue:null, gateWeeksOut:null, enabled:true },
  { id:'RF006', name:'SpEx Below Minimum', description:'Sponsor-exhibitor count below threshold within gate', severity:'high', thresholdValue:2, gateWeeksOut:12, enabled:true },
  { id:'RF007', name:'Zero Bookings This Week', description:'No bookings in last 7 days inside gate window', severity:'critical', thresholdValue:0, gateWeeksOut:6, enabled:true },
  { id:'RF008', name:'Zero Payments This Week', description:'No payments in last 7 days inside gate window', severity:'critical', thresholdValue:0, gateWeeksOut:4, enabled:true },
  { id:'RF009', name:'High Pending Payments', description:'Pending payment count exceeds threshold', severity:'medium', thresholdValue:10, gateWeeksOut:null, enabled:true },
  { id:'RF010', name:'High Cancellation Rate', description:'Cancellation rate exceeds percentage threshold', severity:'high', thresholdValue:20, gateWeeksOut:null, enabled:true, isPercent:true },
  { id:'RF011', name:'No Marketing Activity', description:'Zero marketing replies within gate window', severity:'medium', thresholdValue:0, gateWeeksOut:8, enabled:true },
  { id:'RF012', name:'Booking Velocity Declining', description:'This week bookings less than half of previous week', severity:'medium', thresholdValue:50, gateWeeksOut:null, enabled:true, isPercent:true },
  { id:'RF013', name:'Benchmark Not Crossed', description:'Payment benchmark (30) not hit inside gate window', severity:'critical', thresholdValue:30, gateWeeksOut:6, enabled:true },
];

const DEFAULT_DECISION_TIERS = { watch: 1, escalate: 3, critical: 5 };

Object.assign(window, {
  RECOMMENDATION_COLORS, RECOMMENDATION_ORDER, STATUS_COLORS, SEVERITY_COLORS,
  MOCK_EVENTS, DEFAULT_RED_FLAG_RULES, DEFAULT_DECISION_TIERS, generateMockEvents
});
