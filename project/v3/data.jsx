// EPM v3 — Data Layer + Design Tokens (Light Premium)

// ─── Design Tokens ───
// Warm neutral palette with deep violet accent — Stripe meets Anthropic
const T = {
  // Backgrounds — cool neutral, not warm
  bg: '#f7f8fa',
  bgCard: '#ffffff',
  bgHover: '#f2f3f7',
  bgSubtle: '#edeef2',
  bgInset: '#f4f5f8',

  // Borders — barely there
  border: '#e4e5eb',
  borderLight: '#ededf0',
  borderHover: '#d0d1d8',

  // Shadows — soft, layered
  shadow1: '0 1px 2px rgba(0,0,0,0.04)',
  shadow2: '0 2px 8px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.08)',
  shadow3: '0 8px 30px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.1)',

  // Text — high contrast hierarchy
  text: '#111318',
  textMid: '#555a66',
  textDim: '#888d9b',
  textFaint: '#b4b8c4',

  // Accent — muted indigo
  accent: '#5046e4',
  accentLight: '#6e66ea',
  accentBg: '#5046e406',
  accentBorder: '#5046e416',

  // Status — desaturated, sophisticated
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

  // Typography
  sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
  serif: "'Fraunces', Georgia, serif",
};

const REC_MAP = {
  'GO':                   { color: T.go, bg: T.goBg, label: 'GO' },
  'GO — BENCHMARK CROSSED': { color: T.go, bg: T.goBg, label: 'GO ✓' },
  'WATCH':                { color: T.watch, bg: T.watchBg, label: 'WATCH' },
  'ESCALATE':             { color: T.escalate, bg: T.escalateBg, label: 'ESCALATE' },
  'CRITICAL':             { color: T.critical, bg: T.criticalBg, label: 'CRITICAL' },
  'POSTPONED':            { color: T.postponed, bg: T.postponedBg, label: 'POSTPONED' },
};
const REC_ORDER = ['CRITICAL','ESCALATE','WATCH','POSTPONED','GO','GO — BENCHMARK CROSSED'];
const STATUS_MAP = {
  'Going Ahead': T.go, 'Standby': T.escalate, 'Postponed': T.critical, 'Postpone': T.critical, 'Cancelled': T.postponed,
};
const SEV_MAP = { critical: T.critical, high: T.escalate, medium: T.watch, low: T.go };

// ─── Raw Zoho database fields (auto-populated from schema)
const ZOHO_FIELDS = [
  { key: 'registration_id', label: 'Registration ID', type: 'string', table: 'Registrations' },
  { key: 'registration_status', label: 'Registration Status', type: 'enum', table: 'Registrations', values: ['Active','Cancelled','Pending','Waitlist'] },
  { key: 'registration_date', label: 'Registration Date', type: 'date', table: 'Registrations' },
  { key: 'ticket_type', label: 'Ticket Type', type: 'enum', table: 'Registrations', values: ['Paid','Free','Complimentary','VIP','Speaker'] },
  { key: 'event_code', label: 'Event Code', type: 'string', table: 'Events' },
  { key: 'event_date', label: 'Event Date', type: 'date', table: 'Events' },
  { key: 'event_year', label: 'Event Year', type: 'number', table: 'Events' },
  { key: 'booking_date', label: 'Booking Date', type: 'date', table: 'Bookings' },
  { key: 'booking_status', label: 'Booking Status', type: 'enum', table: 'Bookings', values: ['Confirmed','Pending','Cancelled'] },
  { key: 'payment_amount', label: 'Payment Amount', type: 'currency', table: 'Payments' },
  { key: 'payment_status', label: 'Payment Status', type: 'enum', table: 'Payments', values: ['Paid','Pending','Refunded','Cancelled'] },
  { key: 'payment_date', label: 'Payment Date', type: 'date', table: 'Payments' },
  { key: 'speaker_status', label: 'Speaker Status', type: 'enum', table: 'Speakers', values: ['Confirmed','Pending','Declined','Standby'] },
  { key: 'speaker_fee_type', label: 'Speaker Fee Type', type: 'enum', table: 'Speakers', values: ['Paid','Free','Honorarium'] },
  { key: 'speaker_grade', label: 'Speaker Grade', type: 'enum', table: 'Speakers', values: ['A','B','C','Ungraded'] },
  { key: 'sponsor_tier', label: 'Sponsor Tier', type: 'enum', table: 'Sponsors', values: ['Platinum','Gold','Silver','Bronze'] },
  { key: 'sponsor_status', label: 'Sponsor Status', type: 'enum', table: 'Sponsors', values: ['Confirmed','Prospect','Lost'] },
  { key: 'marketing_reply_date', label: 'Reply Date', type: 'date', table: 'Marketing' },
  { key: 'marketing_channel', label: 'Channel', type: 'enum', table: 'Marketing', values: ['Email','LinkedIn','Phone','Event'] },
  { key: 'spf_score', label: 'Sales Pitch Factor', type: 'number', table: 'Marketing' },
  { key: 'tm_call_result', label: 'Call Result', type: 'enum', table: 'Telemarketing', values: ['Interested','Not Interested','Callback','No Answer'] },
  { key: 'tm_call_date', label: 'Call Date', type: 'date', table: 'Telemarketing' },
];

const FIELD_TABLES = [...new Set(ZOHO_FIELDS.map(f => f.table))];
const TYPE_ICONS = { string: 'Aa', number: '#', date: '◷', enum: '◉', currency: '$' };

// ─── Operations for formula builder
const OPERATIONS = [
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
];

// ─── Default calculated formulas (the OUTPUTS)
const CALC_FORMULAS = [
  { id:'F001', name:'Live Count', output:'live_count', desc:'Active registrations for current year',
    blocks:[{t:'field',v:'registration_status'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'= Active'},{t:'logic',v:'AND'},{t:'field',v:'event_year'},{t:'cmp',v:'='},{t:'val',v:'2025'}] },
  { id:'F002', name:'Paid Delegates', output:'paid_delegates', desc:'Confirmed paid attendees',
    blocks:[{t:'field',v:'payment_amount'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'> 0'},{t:'logic',v:'AND'},{t:'field',v:'payment_status'},{t:'cmp',v:'≠'},{t:'val',v:'Cancelled'}] },
  { id:'F003', name:'Free Attendees', output:'free_attendees', desc:'Complimentary registrations',
    blocks:[{t:'field',v:'ticket_type'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'= Free'},{t:'logic',v:'AND'},{t:'field',v:'registration_status'},{t:'cmp',v:'='},{t:'val',v:'Active'}] },
  { id:'F004', name:'Cancelled Count', output:'cancelled_count', desc:'Total cancelled bookings',
    blocks:[{t:'field',v:'payment_status'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'= Cancelled'}] },
  { id:'F005', name:'YoY Comparison', output:'yoy_pct', desc:'Year-over-year percentage change',
    blocks:[{t:'ref',v:'live_count'},{t:'math',v:'÷'},{t:'ref',v:'live_count_ly'},{t:'math',v:'×'},{t:'val',v:'100'},{t:'math',v:'−'},{t:'val',v:'100'}] },
  { id:'F006', name:'33% Projection', output:'proj_33', desc:'Conservative projection at 33% velocity',
    blocks:[{t:'ref',v:'live_count'},{t:'math',v:'+'},{t:'paren',v:'('},{t:'ref',v:'live_count'},{t:'math',v:'÷'},{t:'ref',v:'weeks_elapsed'},{t:'paren',v:')'},{t:'math',v:'×'},{t:'ref',v:'weeks_remaining'},{t:'math',v:'×'},{t:'val',v:'0.33'}] },
  { id:'F007', name:'Cancellation Rate', output:'cancel_rate', desc:'Percentage of bookings cancelled',
    blocks:[{t:'ref',v:'cancelled_count'},{t:'math',v:'÷'},{t:'paren',v:'('},{t:'ref',v:'paid_delegates'},{t:'math',v:'+'},{t:'ref',v:'cancelled_count'},{t:'paren',v:')'},{t:'math',v:'×'},{t:'val',v:'100'}] },
  { id:'F008', name:'Booking Velocity 7d', output:'bv_7d', desc:'Bookings in last 7 days',
    blocks:[{t:'field',v:'booking_date'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'≥ TODAY() − 7'}] },
];

const BLOCK_STYLE = {
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

// ─── Mock events (reuse generation logic from v2 but with updated shape)
const CITIES = ['DDU','SFO','LDN','TYO','SYD','BER','SIN','DXB','NYC','CHI','LAX','MIA','SEA','BOS','ATL','DAL','DEN','PHX','PHL','HOU','AMS','PAR','MIL','BCN','MUN','VIE','ZUR','OSL','CPH','HEL','WAR','PRG','BUD','LIS','DUB','EDI','MAN','BHM','GLA','BRS','LEE','CDF','TOR','MEX','SAO','BUE','LIM','SCL','BOG','JKT','BKK','KUL','HKG','TPE','SEL','MNL','DEL','MUM','BLR','HYD','PUN','AHM','KOL','CHN','JNB','CPT','NBO','LOS','ACC','CAI','CAS','ALG','TUN','DOH','RUH','JED','KWT','BAH','MUS','MCT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REPS = ['VV','PM','PT','JS','AK','RD','ML','SG'];
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}

function genEvents(n=80){
  const sts=['Going Ahead','Going Ahead','Going Ahead','Going Ahead','Going Ahead','Standby','Postponed','Cancelled'];
  return Array.from({length:n},(_,i)=>{
    const city=CITIES[i%CITIES.length],mo=MONTHS[(i*3+1)%12],day=(i%28)+1,wo=rand(-4,32);
    const exp=rand(80,400),l25=Math.floor(exp*(0.15+Math.random()*0.95)),l24=Math.floor(exp*(0.25+Math.random()*0.75)),f24=Math.floor(l24*(1+Math.random()*0.35));
    const paid=Math.floor(l25*(0.25+Math.random()*0.55)),free=Math.floor(l25*(0.08+Math.random()*0.15)),pend=rand(0,18),canc=rand(0,10);
    const plt=rand(0,3),gld=rand(0,5),slv=rand(0,7),spex=plt+gld+slv;
    const b={today:rand(0,8),yesterday:rand(0,10),d7:rand(0,28),d14:rand(0,32),d21:rand(0,24)};
    const p={today:rand(0,6),yesterday:rand(0,7),d7:rand(0,20),d14:rand(0,22),d21:rand(0,16)};
    const spkB=rand(2,14),spkP=Math.floor(spkB*0.6),spkF=rand(0,5),spkC=spkP+spkF+rand(0,4),spkS=Math.max(0,10-spkC);
    const mAll=rand(20,250),m7=rand(0,40),m14=rand(0,45),m21=rand(0,35),tmC=rand(0,60);
    const status=pick(sts),bench=paid>=30;
    const flags=[];
    if(Math.random()>0.7)flags.push({id:'RF001',name:'Agenda Not Live',sev:'high',thresh:'Published',cur:'Not published'});
    if(l25<l24)flags.push({id:'RF002',name:'Underperforming vs LY',sev:'medium',thresh:`≥${l24}`,cur:`${l25}`});
    if(paid<20&&wo<=12&&wo>0)flags.push({id:'RF003',name:'Payments Below Min',sev:'critical',thresh:'≥20',cur:`${paid}`});
    if(exp>0&&l25/exp<0.4&&wo<=12&&wo>0)flags.push({id:'RF004',name:'Delegates <40%',sev:'critical',thresh:`≥${Math.ceil(exp*0.4)}`,cur:`${l25}`});
    if(Math.random()>0.55)flags.push({id:'RF005',name:'Agenda Not Full',sev:'medium',thresh:'0 empty',cur:`${rand(1,4)} slots`});
    if(spex<2&&wo<=12&&wo>0)flags.push({id:'RF006',name:'SpEx Below Min',sev:'high',thresh:'≥2',cur:`${spex}`});
    if(b.d7===0&&wo<=6&&wo>0)flags.push({id:'RF007',name:'Zero Bookings 7d',sev:'critical',thresh:'>0',cur:'0'});
    if(p.d7===0&&wo<=4&&wo>0)flags.push({id:'RF008',name:'Zero Payments 7d',sev:'critical',thresh:'>0',cur:'0'});
    if(pend>10)flags.push({id:'RF009',name:'High Pending',sev:'medium',thresh:'≤10',cur:`${pend}`});
    if(canc/(paid+canc||1)>0.2)flags.push({id:'RF010',name:'High Cancel Rate',sev:'high',thresh:'<20%',cur:`${Math.round(canc/(paid+canc||1)*100)}%`});
    if(m7===0&&wo<=8&&wo>0)flags.push({id:'RF011',name:'No Marketing 7d',sev:'medium',thresh:'>0',cur:'0'});
    if(b.d14>0&&b.d7<b.d14*0.5)flags.push({id:'RF012',name:'Velocity Declining',sev:'medium',thresh:`≥${Math.ceil(b.d14*0.5)}`,cur:`${b.d7}`});
    if(!bench&&wo<=6&&wo>0)flags.push({id:'RF013',name:'Benchmark Not Hit',sev:'critical',thresh:'≥30',cur:`${paid}`});
    let rec='GO';
    if(status==='Postponed'||status==='Postpone')rec='POSTPONED';
    else if(status==='Cancelled')rec='POSTPONED';
    else if(status==='Standby')rec='ESCALATE';
    else if(flags.length>=5)rec='CRITICAL';
    else if(flags.length>=3)rec='ESCALATE';
    else if(flags.length>=1)rec='WATCH';
    else if(bench)rec='GO — BENCHMARK CROSSED';
    const proj33=wo>0?Math.round(l25+(l25/Math.max(1,32-wo))*wo*0.33):l25;
    return {id:`e${i}`,code:`${mo}(${day})/${city}`,rep:REPS[i%REPS.length],weeksOut:wo,status,rec,flagCount:flags.length,flags,live25:l25,live24:l24,expected:exp,final24:f24,paid,free,pending:pend,cancelled:canc,spex,plt,gld,slv,bench:bench?'Crossed':`${paid}/30`,bookings:b,payments:p,speakers:{booked:spkB,paid:spkP,free:spkF,confirmed:spkC,shortage:spkS,standby:rand(0,4),grading:rand(0,6),proposals:rand(2,12),interested:rand(5,20)},marketing:{all:mAll,spf:Math.floor(mAll*0.3),d7:m7,d14:m14,d21:m21},tm:{called:tmC,lhf0:Math.floor(tmC*0.3),blue:Math.floor(tmC*0.15),agenda:Math.floor(tmC*0.5)},proj33};
  });
}

const EVENTS3=genEvents(80);
const RULES3=[
  {id:'RF001',name:'Agenda Not Live',desc:'Agenda has not been published yet',sev:'high',val:null,gate:null,on:true},
  {id:'RF002',name:'Underperforming vs LY',desc:'Live count below last year at same point',sev:'medium',val:null,gate:null,on:true},
  {id:'RF003',name:'Payments Below Minimum',desc:'Paid head count below threshold within gate',sev:'critical',val:20,gate:12,on:true},
  {id:'RF004',name:'Delegates Below 40%',desc:'Live count below % of expected within gate',sev:'critical',val:40,gate:12,on:true,pct:true},
  {id:'RF005',name:'Agenda Not Full',desc:'Unfilled speaker/panel slots',sev:'medium',val:null,gate:null,on:true},
  {id:'RF006',name:'SpEx Below Minimum',desc:'Sponsor-exhibitor count below threshold',sev:'high',val:2,gate:12,on:true},
  {id:'RF007',name:'Zero Bookings (6w gate)',desc:'No bookings in last 7d inside 6-week gate',sev:'critical',val:0,gate:6,on:true},
  {id:'RF008',name:'Zero Payments (4w gate)',desc:'No payments in last 7d inside 4-week gate',sev:'critical',val:0,gate:4,on:true},
  {id:'RF009',name:'High Pending Payments',desc:'Pending payments exceed threshold',sev:'medium',val:10,gate:null,on:true},
  {id:'RF010',name:'High Cancellation Rate',desc:'Cancel rate exceeds % threshold',sev:'high',val:20,gate:null,on:true,pct:true},
  {id:'RF011',name:'No Marketing Activity',desc:'Zero marketing replies within gate',sev:'medium',val:0,gate:8,on:true},
  {id:'RF012',name:'Booking Velocity Declining',desc:'This week < half of prior week',sev:'medium',val:50,gate:null,on:true,pct:true},
  {id:'RF013',name:'Benchmark Not Crossed',desc:'Payment benchmark not hit inside gate',sev:'critical',val:30,gate:6,on:true},
];

Object.assign(window,{T,REC_MAP,REC_ORDER,STATUS_MAP,SEV_MAP,ZOHO_FIELDS,FIELD_TABLES,TYPE_ICONS,OPERATIONS,CALC_FORMULAS,BLOCK_STYLE,EVENTS3,RULES3,rand,pick});
