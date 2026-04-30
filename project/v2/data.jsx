// EPM v2 — Data Layer
const C = {
  bg0: '#06080e', bg1: '#0a0f1a', bg2: '#0f1526', bg3: '#141d30',
  border: '#1a2440', borderLight: '#243052',
  text: '#e8ecf4', textMid: '#8b95ad', textDim: '#4a5570',
  accent: '#3b82f6', accentGlow: '#3b82f620',
  go: '#00E676', watch: '#FFD740', escalate: '#FF6E40', critical: '#FF1744', postponed: '#9E9E9E',
};

const REC_COLORS = {
  'GO': C.go, 'GO — BENCHMARK CROSSED': C.go, 'WATCH': C.watch,
  'ESCALATE': C.escalate, 'CRITICAL': C.critical, 'POSTPONED': C.postponed,
};
const REC_ORDER = ['CRITICAL','ESCALATE','WATCH','POSTPONED','GO','GO — BENCHMARK CROSSED'];
const STATUS_COLORS = { 'Going Ahead': C.go, 'Standby': C.escalate, 'Postponed': C.critical, 'Postpone': C.critical, 'Cancelled': C.postponed };
const SEV_COLORS = { critical: C.critical, high: C.escalate, medium: C.watch, low: C.go };

const CITIES = ['DDU','SFO','LDN','TYO','SYD','BER','SIN','DXB','NYC','CHI','LAX','MIA','SEA','BOS','ATL','DAL','DEN','PHX','PHL','HOU','AMS','PAR','MIL','BCN','MUN','VIE','ZUR','OSL','CPH','HEL','WAR','PRG','BUD','LIS','DUB','EDI','MAN','BHM','GLA','BRS','LEE','CDF','TOR','MEX','SAO','BUE','LIM','SCL','BOG','JKT','BKK','KUL','HKG','TPE','SEL','MNL','DEL','MUM','BLR','HYD','PUN','AHM','KOL','CHN','JNB','CPT','NBO','LOS','ACC','CAI','CAS','ALG','TUN','DOH','RUH','JED','KWT','BAH','MUS','MCT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REPS = ['VV','PM','PT','JS','AK','RD','ML','SG'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function genEvents(n = 80) {
  const statuses = ['Going Ahead','Going Ahead','Going Ahead','Going Ahead','Going Ahead','Standby','Postponed','Cancelled'];
  return Array.from({ length: n }, (_, i) => {
    const city = CITIES[i % CITIES.length];
    const mo = MONTHS[(i * 3 + 1) % 12];
    const day = (i % 28) + 1;
    const weeksOut = rand(-4, 32);
    const expected = rand(80, 400);
    const live25 = Math.floor(expected * (0.15 + Math.random() * 0.95));
    const live24 = Math.floor(expected * (0.25 + Math.random() * 0.75));
    const final24 = Math.floor(live24 * (1 + Math.random() * 0.35));
    const paid = Math.floor(live25 * (0.25 + Math.random() * 0.55));
    const free = Math.floor(live25 * (0.08 + Math.random() * 0.15));
    const pending = rand(0, 18);
    const cancelled = rand(0, 10);
    const plt = rand(0, 3), gld = rand(0, 5), slv = rand(0, 7);
    const spex = plt + gld + slv;
    const b = { today: rand(0, 8), yesterday: rand(0, 10), d7: rand(0, 28), d14: rand(0, 32), d21: rand(0, 24) };
    const p = { today: rand(0, 6), yesterday: rand(0, 7), d7: rand(0, 20), d14: rand(0, 22), d21: rand(0, 16) };
    const spkB = rand(2, 14), spkP = Math.floor(spkB * 0.6), spkF = rand(0, 5);
    const spkC = spkP + spkF + rand(0, 4), spkS = Math.max(0, 10 - spkC);
    const mAll = rand(20, 250), m7 = rand(0, 40), m14 = rand(0, 45), m21 = rand(0, 35);
    const tmC = rand(0, 60);
    const status = pick(statuses);
    const bench = paid >= 30;

    const flags = [];
    if (Math.random() > 0.7) flags.push({ id:'RF001', name:'Agenda Not Live', sev:'high', thresh:'Published', cur:'Not published' });
    if (live25 < live24) flags.push({ id:'RF002', name:'Underperforming vs LY', sev:'medium', thresh:`≥${live24}`, cur:`${live25}` });
    if (paid < 20 && weeksOut <= 12 && weeksOut > 0) flags.push({ id:'RF003', name:'Payments Below Min', sev:'critical', thresh:'≥20', cur:`${paid}` });
    if (expected > 0 && live25/expected < 0.4 && weeksOut <= 12 && weeksOut > 0) flags.push({ id:'RF004', name:'Delegates <40%', sev:'critical', thresh:`≥${Math.ceil(expected*0.4)}`, cur:`${live25}` });
    if (Math.random() > 0.55) flags.push({ id:'RF005', name:'Agenda Not Full', sev:'medium', thresh:'0 empty', cur:`${rand(1,4)} slots` });
    if (spex < 2 && weeksOut <= 12 && weeksOut > 0) flags.push({ id:'RF006', name:'SpEx Below Min', sev:'high', thresh:'≥2', cur:`${spex}` });
    if (b.d7 === 0 && weeksOut <= 6 && weeksOut > 0) flags.push({ id:'RF007', name:'Zero Bookings 7d', sev:'critical', thresh:'>0', cur:'0' });
    if (p.d7 === 0 && weeksOut <= 4 && weeksOut > 0) flags.push({ id:'RF008', name:'Zero Payments 7d', sev:'critical', thresh:'>0', cur:'0' });
    if (pending > 10) flags.push({ id:'RF009', name:'High Pending', sev:'medium', thresh:'≤10', cur:`${pending}` });
    if (cancelled/(paid+cancelled||1) > 0.2) flags.push({ id:'RF010', name:'High Cancel Rate', sev:'high', thresh:'<20%', cur:`${Math.round(cancelled/(paid+cancelled||1)*100)}%` });
    if (m7 === 0 && weeksOut <= 8 && weeksOut > 0) flags.push({ id:'RF011', name:'No Marketing 7d', sev:'medium', thresh:'>0', cur:'0' });
    if (b.d14 > 0 && b.d7 < b.d14*0.5) flags.push({ id:'RF012', name:'Velocity Declining', sev:'medium', thresh:`≥${Math.ceil(b.d14*0.5)}`, cur:`${b.d7}` });
    if (!bench && weeksOut <= 6 && weeksOut > 0) flags.push({ id:'RF013', name:'Benchmark Not Hit', sev:'critical', thresh:'≥30', cur:`${paid}` });

    let rec = 'GO';
    if (status === 'Postponed' || status === 'Postpone') rec = 'POSTPONED';
    else if (status === 'Cancelled') rec = 'POSTPONED';
    else if (status === 'Standby') rec = 'ESCALATE';
    else if (flags.length >= 5) rec = 'CRITICAL';
    else if (flags.length >= 3) rec = 'ESCALATE';
    else if (flags.length >= 1) rec = 'WATCH';
    else if (bench) rec = 'GO — BENCHMARK CROSSED';

    // projection
    const proj33 = weeksOut > 0 ? Math.round(live25 + (live25 / Math.max(1, 32 - weeksOut)) * weeksOut * 0.33) : live25;

    return {
      id: `e${i}`, code: `${mo}(${day})/${city}`, rep: REPS[i % REPS.length],
      weeksOut, status, rec, flagCount: flags.length, flags,
      live25, live24, expected, final24, paid, free, pending, cancelled,
      spex, plt, gld, slv, bench: bench ? 'Crossed' : `${paid}/30`,
      bookings: b, payments: p,
      speakers: { booked: spkB, paid: spkP, free: spkF, confirmed: spkC, shortage: spkS, standby: rand(0,4), grading: rand(0,6), proposals: rand(2,12), interested: rand(5,20) },
      marketing: { all: mAll, spf: Math.floor(mAll*0.3), d7: m7, d14: m14, d21: m21 },
      tm: { called: tmC, lhf0: Math.floor(tmC*0.3), blue: Math.floor(tmC*0.15), agenda: Math.floor(tmC*0.5) },
      proj33,
    };
  });
}

const EVENTS = genEvents(80);

const RULES = [
  { id:'RF001', name:'Agenda Not Live', desc:'Agenda has not been published yet', sev:'high', val:null, gate:null, on:true },
  { id:'RF002', name:'Underperforming vs LY', desc:'Live count below last year at same point', sev:'medium', val:null, gate:null, on:true },
  { id:'RF003', name:'Payments Below Minimum', desc:'Paid head count below threshold within gate', sev:'critical', val:20, gate:12, on:true, pct:false },
  { id:'RF004', name:'Delegates Below 40%', desc:'Live count below % of expected within gate', sev:'critical', val:40, gate:12, on:true, pct:true },
  { id:'RF005', name:'Agenda Not Full', desc:'Unfilled speaker/panel slots', sev:'medium', val:null, gate:null, on:true },
  { id:'RF006', name:'SpEx Below Minimum', desc:'Sponsor-exhibitor count below threshold', sev:'high', val:2, gate:12, on:true },
  { id:'RF007', name:'Zero Bookings (6w gate)', desc:'No bookings in last 7d inside 6-week gate', sev:'critical', val:0, gate:6, on:true },
  { id:'RF008', name:'Zero Payments (4w gate)', desc:'No payments in last 7d inside 4-week gate', sev:'critical', val:0, gate:4, on:true },
  { id:'RF009', name:'High Pending Payments', desc:'Pending payments exceed threshold', sev:'medium', val:10, gate:null, on:true },
  { id:'RF010', name:'High Cancellation Rate', desc:'Cancel rate exceeds % threshold', sev:'high', val:20, gate:null, on:true, pct:true },
  { id:'RF011', name:'No Marketing Activity', desc:'Zero marketing replies within gate', sev:'medium', val:0, gate:8, on:true },
  { id:'RF012', name:'Booking Velocity Declining', desc:'This week < half of prior week', sev:'medium', val:50, gate:null, on:true, pct:true },
  { id:'RF013', name:'Benchmark Not Crossed', desc:'Payment benchmark not hit inside gate', sev:'critical', val:30, gate:6, on:true },
];

const FORMULAS = [
  { id:'F001', name:'Live Count', output:'live25', expr:[{type:'field',val:'Registrations'},{type:'op',val:'COUNT WHERE'},{type:'cond',val:'Status = Active'},{type:'op',val:'AND'},{type:'cond',val:'Year = 2025'}], desc:'Count of active registrations for current year' },
  { id:'F002', name:'Paid Delegates', output:'paid', expr:[{type:'field',val:'Payments'},{type:'op',val:'COUNT WHERE'},{type:'cond',val:'Amount > 0'},{type:'op',val:'AND'},{type:'cond',val:'Status ≠ Cancelled'}], desc:'Confirmed paid attendees' },
  { id:'F003', name:'Free Attendees', output:'free', expr:[{type:'field',val:'Registrations'},{type:'op',val:'COUNT WHERE'},{type:'cond',val:'TicketType = Free'},{type:'op',val:'AND'},{type:'cond',val:'Status = Active'}], desc:'Complimentary/free registrations' },
  { id:'F004', name:'Cancelled Count', output:'cancelled', expr:[{type:'field',val:'Payments'},{type:'op',val:'COUNT WHERE'},{type:'cond',val:'Status = Cancelled'}], desc:'Total cancelled bookings' },
  { id:'F005', name:'YoY Comparison', output:'yoy', expr:[{type:'field',val:'Live Count 2025'},{type:'op',val:'÷'},{type:'field',val:'Live Count 2024'},{type:'op',val:'×'},{type:'num',val:'100'},{type:'op',val:'−'},{type:'num',val:'100'}], desc:'Year-over-year percentage change' },
  { id:'F006', name:'33% Projection', output:'proj33', expr:[{type:'field',val:'Live Count'},{type:'op',val:'+'},{type:'paren',val:'('},{type:'field',val:'Live Count'},{type:'op',val:'÷'},{type:'field',val:'Weeks Elapsed'},{type:'paren',val:')'},{type:'op',val:'×'},{type:'field',val:'Weeks Remaining'},{type:'op',val:'×'},{type:'num',val:'0.33'}], desc:'Conservative projection at 33% of current velocity' },
  { id:'F007', name:'Cancellation Rate', output:'cancelRate', expr:[{type:'field',val:'Cancelled'},{type:'op',val:'÷'},{type:'paren',val:'('},{type:'field',val:'Paid'},{type:'op',val:'+'},{type:'field',val:'Cancelled'},{type:'paren',val:')'},{type:'op',val:'×'},{type:'num',val:'100'}], desc:'Percentage of bookings that cancelled' },
  { id:'F008', name:'Booking Velocity 7d', output:'bv7', expr:[{type:'field',val:'Bookings'},{type:'op',val:'COUNT WHERE'},{type:'cond',val:'Date ≥ TODAY() - 7'}], desc:'Bookings in last 7 days' },
];

const BLOCK_TYPES = {
  field: { color: '#3b82f6', bg: '#3b82f615', label: 'Field' },
  op: { color: '#a78bfa', bg: '#a78bfa15', label: 'Operation' },
  cond: { color: '#f59e0b', bg: '#f59e0b15', label: 'Condition' },
  num: { color: '#00E676', bg: '#00E67615', label: 'Number' },
  paren: { color: '#8b95ad', bg: '#8b95ad10', label: '' },
};

Object.assign(window, { C, REC_COLORS, REC_ORDER, STATUS_COLORS, SEV_COLORS, EVENTS, RULES, FORMULAS, BLOCK_TYPES, rand, pick });
