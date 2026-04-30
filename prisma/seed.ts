import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES = ['DDU','SFO','LDN','TYO','SYD','BER','SIN','DXB','NYC','CHI','LAX','MIA','SEA','BOS','ATL','DAL','DEN','PHX','PHL','HOU','AMS','PAR','MIL','BCN','MUN','VIE','ZUR','OSL','CPH','HEL','WAR','PRG','BUD','LIS','DUB','EDI','MAN','BHM','GLA','BRS','LEE','CDF','TOR','MEX','SAO','BUE','LIM','SCL','BOG','JKT','BKK','KUL','HKG','TPE','SEL','MNL','DEL','MUM','BLR','HYD','PUN','AHM','KOL','CHN','JNB','CPT','NBO','LOS','ACC','CAI','CAS','ALG','TUN','DOH','RUH','JED','KWT','BAH','MUS','MCT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REPS   = ['VV','PM','PT','JS','AK','RD','ML','SG'];
const STATUSES = ['Going Ahead','Going Ahead','Going Ahead','Going Ahead','Going Ahead','Standby','Postponed','Cancelled'];

function rand(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }

const THIS_YEAR = new Date().getFullYear();
const LAST_YEAR = THIS_YEAR - 1;

async function main() {
  const existing = await prisma.eventRecord.count();
  if (existing > 0) {
    console.log(`⏭  Seed skipped — ${existing} events already in database`);
    return;
  }

  console.log('🌱 Seeding EPM database…');

  await prisma.redFlagRule.deleteMany();
  await prisma.calculatedFormula.deleteMany();
  await prisma.decisionTier.deleteMany();
  await prisma.dropdownOption.deleteMany();

  await prisma.decisionTier.createMany({
    data: [
      { level: 'watch',    flagCount: 1, description: 'Monitor weekly' },
      { level: 'escalate', flagCount: 3, description: 'Management call 48hrs' },
      { level: 'critical', flagCount: 5, description: 'Recommend postpone/kill' },
    ],
  });

  await prisma.redFlagRule.createMany({
    data: [
      { id:'RF001', name:'Agenda Not Live',           description:'Agenda has not been published yet',          severity:'high',     thresholdValue:null, gateWeeks:null, isPercent:false, isActive:true, sortOrder:0  },
      { id:'RF002', name:'Underperforming vs LY',     description:'Live count below last year at same point',   severity:'medium',   thresholdValue:null, gateWeeks:null, isPercent:false, isActive:true, sortOrder:1  },
      { id:'RF003', name:'Payments Below Minimum',    description:'Paid head count below threshold within gate',severity:'critical', thresholdValue:20,   gateWeeks:12,   isPercent:false, isActive:true, sortOrder:2  },
      { id:'RF004', name:'Delegates Below 40%',       description:'Live count below % of expected within gate', severity:'critical', thresholdValue:40,   gateWeeks:12,   isPercent:true,  isActive:true, sortOrder:3  },
      { id:'RF005', name:'Agenda Not Full',           description:'Unfilled speaker/panel slots',               severity:'medium',   thresholdValue:null, gateWeeks:null, isPercent:false, isActive:true, sortOrder:4  },
      { id:'RF006', name:'SpEx Below Minimum',        description:'Sponsor-exhibitor count below threshold',    severity:'high',     thresholdValue:2,    gateWeeks:12,   isPercent:false, isActive:true, sortOrder:5  },
      { id:'RF007', name:'Zero Bookings (6w gate)',   description:'No bookings in last 7d inside 6-week gate',  severity:'critical', thresholdValue:0,    gateWeeks:6,    isPercent:false, isActive:true, sortOrder:6  },
      { id:'RF008', name:'Zero Payments (4w gate)',   description:'No payments in last 7d inside 4-week gate',  severity:'critical', thresholdValue:0,    gateWeeks:4,    isPercent:false, isActive:true, sortOrder:7  },
      { id:'RF009', name:'High Pending Payments',     description:'Pending payments exceed threshold',          severity:'medium',   thresholdValue:10,   gateWeeks:null, isPercent:false, isActive:true, sortOrder:8  },
      { id:'RF010', name:'High Cancellation Rate',    description:'Cancel rate exceeds % threshold',            severity:'high',     thresholdValue:20,   gateWeeks:null, isPercent:true,  isActive:true, sortOrder:9  },
      { id:'RF011', name:'No Marketing Activity',     description:'Zero marketing replies within gate',         severity:'medium',   thresholdValue:0,    gateWeeks:8,    isPercent:false, isActive:true, sortOrder:10 },
      { id:'RF012', name:'Booking Velocity Declining',description:'This week < half of prior week',             severity:'medium',   thresholdValue:50,   gateWeeks:null, isPercent:true,  isActive:true, sortOrder:11 },
      { id:'RF013', name:'Benchmark Not Crossed',     description:'Payment benchmark not hit inside gate',      severity:'critical', thresholdValue:30,   gateWeeks:6,    isPercent:false, isActive:true, sortOrder:12 },
    ],
  });

  await prisma.calculatedFormula.createMany({
    data: [
      { id:'F001', name:'Live Count',          outputKey:'live_count',      description:'Active registrations for current year',     sortOrder:0, blocks:[{t:'field',v:'registration_status'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'= Active'},{t:'logic',v:'AND'},{t:'field',v:'event_year'},{t:'cmp',v:'='},{t:'val',v:String(THIS_YEAR)}] },
      { id:'F002', name:'Paid Delegates',      outputKey:'paid_delegates',  description:'Confirmed paid attendees',                  sortOrder:1, blocks:[{t:'field',v:'payment_amount'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'> 0'},{t:'logic',v:'AND'},{t:'field',v:'payment_status'},{t:'cmp',v:'≠'},{t:'val',v:'Cancelled'}] },
      { id:'F003', name:'Free Attendees',      outputKey:'free_attendees',  description:'Complimentary registrations',               sortOrder:2, blocks:[{t:'field',v:'ticket_type'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'= Free'},{t:'logic',v:'AND'},{t:'field',v:'registration_status'},{t:'cmp',v:'='},{t:'val',v:'Active'}] },
      { id:'F004', name:'Cancelled Count',     outputKey:'cancelled_count', description:'Total cancelled bookings',                  sortOrder:3, blocks:[{t:'field',v:'payment_status'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'= Cancelled'}] },
      { id:'F005', name:'YoY Comparison',      outputKey:'yoy_pct',         description:'Year-over-year percentage change',          sortOrder:4, blocks:[{t:'ref',v:'live_count'},{t:'math',v:'÷'},{t:'ref',v:'live_count_ly'},{t:'math',v:'×'},{t:'val',v:'100'},{t:'math',v:'−'},{t:'val',v:'100'}] },
      { id:'F006', name:'33% Projection',      outputKey:'proj_33',         description:'Conservative projection at 33% velocity',  sortOrder:5, blocks:[{t:'ref',v:'live_count'},{t:'math',v:'+'},{t:'paren',v:'('},{t:'ref',v:'live_count'},{t:'math',v:'÷'},{t:'ref',v:'weeks_elapsed'},{t:'paren',v:')'},{t:'math',v:'×'},{t:'ref',v:'weeks_remaining'},{t:'math',v:'×'},{t:'val',v:'0.33'}] },
      { id:'F007', name:'Cancellation Rate',   outputKey:'cancel_rate',     description:'Percentage of bookings cancelled',         sortOrder:6, blocks:[{t:'ref',v:'cancelled_count'},{t:'math',v:'÷'},{t:'paren',v:'('},{t:'ref',v:'paid_delegates'},{t:'math',v:'+'},{t:'ref',v:'cancelled_count'},{t:'paren',v:')'},{t:'math',v:'×'},{t:'val',v:'100'}] },
      { id:'F008', name:'Booking Velocity 7d', outputKey:'bv_7d',           description:'Bookings in last 7 days',                  sortOrder:7, blocks:[{t:'field',v:'booking_date'},{t:'op',v:'COUNT WHERE'},{t:'cond',v:'≥ TODAY() − 7'}] },
    ],
  });

  await prisma.dropdownOption.createMany({
    data: [
      ...['Going Ahead','Standby','Postponed','Postpone','Cancelled'].map((v, i) => ({ category:'event_status', value:v, sortOrder:i })),
      ...REPS.map((v, i) => ({ category:'rep_code', value:v, sortOrder:i })),
    ],
  });

  // ─── Events + related data ───
  await prisma.telemarketingCall.deleteMany();
  await prisma.marketingActivity.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.eventRecord.deleteMany();

  const now = new Date();

  // Collect all child records in memory, then bulk-insert per table after events are created
  const allRegistrations: Parameters<typeof prisma.registration.createMany>[0]['data'] = [];
  const allPayments:      Parameters<typeof prisma.payment.createMany>[0]['data']      = [];
  const allBookings:      Parameters<typeof prisma.booking.createMany>[0]['data']      = [];
  const allSpeakers:      Parameters<typeof prisma.speaker.createMany>[0]['data']      = [];
  const allSponsors:      Parameters<typeof prisma.sponsor.createMany>[0]['data']      = [];
  const allMarketing:     Parameters<typeof prisma.marketingActivity.createMany>[0]['data'] = [];
  const allTM:            Parameters<typeof prisma.telemarketingCall.createMany>[0]['data'] = [];

  const eventData: Parameters<typeof prisma.eventRecord.createMany>[0]['data'] = [];

  for (let i = 0; i < 80; i++) {
    const city   = CITIES[i % CITIES.length];
    const mo     = MONTHS[(i * 3 + 1) % 12];
    const day    = (i % 28) + 1;
    const wo     = rand(-4, 32);
    const status = STATUSES[i % STATUSES.length];
    const rep    = REPS[i % REPS.length];

    const eventDate = new Date(now.getTime() + wo * 7 * 24 * 3600 * 1000);
    const code      = `${mo}(${day})/${city}`;
    const expected  = rand(80, 400);

    eventData.push({ eventCode: code, eventDate, eventYear: THIS_YEAR, status, rep, expected, weeksOut: wo });

    // Registrations (this year)
    const liveCount = Math.floor(expected * (0.15 + Math.random() * 0.95));
    const ticketTypes = ['Paid','Paid','Paid','Free','Free','Complimentary','Speaker'];
    for (let j = 0; j < liveCount; j++) {
      const regDate = new Date(now.getTime() - rand(0, 300) * 86400000);
      allRegistrations.push({ registrationStatus:'Active', registrationDate:regDate, ticketType:pick(ticketTypes), eventCode:code, eventYear:THIS_YEAR });
    }

    // Registrations (last year)
    const liveCountLY = Math.floor(expected * (0.25 + Math.random() * 0.75));
    for (let j = 0; j < liveCountLY; j++) {
      const regDate = new Date(now.getTime() - rand(300, 700) * 86400000);
      allRegistrations.push({ registrationStatus:'Active', registrationDate:regDate, ticketType:'Paid', eventCode:code, eventYear:LAST_YEAR });
    }

    // Payments
    const paidCount = Math.floor(liveCount * (0.25 + Math.random() * 0.55));
    for (let j = 0; j < paidCount; j++) {
      allPayments.push({ paymentAmount:rand(200,2500), paymentStatus:'Paid', paymentDate:new Date(now.getTime()-rand(0,120)*86400000), eventCode:code });
    }
    const pendingCount = rand(0, 18);
    for (let j = 0; j < pendingCount; j++) {
      allPayments.push({ paymentAmount:rand(200,2500), paymentStatus:'Pending', paymentDate:new Date(now.getTime()-rand(0,30)*86400000), eventCode:code });
    }
    const cancelledCount = rand(0, 10);
    for (let j = 0; j < cancelledCount; j++) {
      allPayments.push({ paymentAmount:rand(200,2500), paymentStatus:'Cancelled', paymentDate:new Date(now.getTime()-rand(0,60)*86400000), eventCode:code });
    }

    // Bookings
    const bookingHours = [
      ...Array(rand(0,8)).fill(0).map(()=>rand(0,20)),
      ...Array(rand(0,10)).fill(0).map(()=>rand(24,48)),
      ...Array(rand(0,28)).fill(0).map(()=>rand(48,7*24)),
      ...Array(rand(0,32)).fill(0).map(()=>rand(7*24,14*24)),
      ...Array(rand(0,24)).fill(0).map(()=>rand(14*24,21*24)),
    ];
    for (const h of bookingHours) {
      allBookings.push({ bookingDate:new Date(now.getTime()-h*3600000), bookingStatus:'Confirmed', eventCode:code });
    }

    // Speakers
    const grades = ['A','B','C','Ungraded'];
    const feeTypes = ['Paid','Paid','Free','Free','Honorarium'];
    const spkStatuses = ['Confirmed','Confirmed','Confirmed','Pending','Standby','Declined'];
    for (let j = 0; j < rand(2,14); j++) {
      allSpeakers.push({ speakerStatus:pick(spkStatuses), speakerFeeType:pick(feeTypes), speakerGrade:pick(grades), eventCode:code });
    }

    // Sponsors
    for (let j = 0; j < rand(0,3); j++) allSponsors.push({ sponsorTier:'Platinum', sponsorStatus:'Confirmed', eventCode:code });
    for (let j = 0; j < rand(0,5); j++) allSponsors.push({ sponsorTier:'Gold',     sponsorStatus:'Confirmed', eventCode:code });
    for (let j = 0; j < rand(0,7); j++) allSponsors.push({ sponsorTier:'Silver',   sponsorStatus:'Confirmed', eventCode:code });

    // Marketing
    const channels = ['Email','Email','LinkedIn','Phone','Event'];
    for (let j = 0; j < rand(20,250); j++) {
      allMarketing.push({ marketingReplyDate:new Date(now.getTime()-rand(0,60)*86400000), marketingChannel:pick(channels), spfScore:rand(0,5), eventCode:code });
    }

    // Telemarketing
    const tmResults = ['Interested','Not Interested','Callback','No Answer'];
    for (let j = 0; j < rand(0,60); j++) {
      allTM.push({ tmCallResult:pick(tmResults), tmCallDate:new Date(now.getTime()-rand(0,30)*86400000), isMagicBlue:Math.random()>0.85, isAgendaView:Math.random()>0.5, isLhfZero:Math.random()>0.7, eventCode:code });
    }
  }

  // Bulk insert events first (FK parent)
  await prisma.eventRecord.createMany({ data: eventData });
  console.log('  ✓ 80 events created');

  // Bulk insert all children in parallel
  const CHUNK = 500;
  async function insertChunked<T>(label: string, data: T[], fn: (chunk: T[]) => Promise<unknown>) {
    for (let i = 0; i < data.length; i += CHUNK) {
      await fn(data.slice(i, i + CHUNK));
    }
    console.log(`  ✓ ${data.length} ${label} inserted`);
  }

  await insertChunked('registrations', allRegistrations, chunk => prisma.registration.createMany({ data: chunk }));
  await insertChunked('payments',      allPayments,      chunk => prisma.payment.createMany({ data: chunk }));
  await insertChunked('bookings',      allBookings,      chunk => prisma.booking.createMany({ data: chunk }));
  await insertChunked('speakers',      allSpeakers,      chunk => prisma.speaker.createMany({ data: chunk }));
  await insertChunked('sponsors',      allSponsors,      chunk => prisma.sponsor.createMany({ data: chunk }));
  await insertChunked('marketing',     allMarketing,     chunk => prisma.marketingActivity.createMany({ data: chunk }));
  await insertChunked('tm calls',      allTM,            chunk => prisma.telemarketingCall.createMany({ data: chunk }));

  console.log('✅ Seed complete — 80 events with full dataset');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
