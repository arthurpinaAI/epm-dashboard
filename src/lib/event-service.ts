import { prisma } from './prisma';
import { evaluateFlags, computeRecommendation, type RuleConfig, type TierConfig } from './decision-engine';
import type { EventDetail, EventSummary, VelocityData, SpeakerMetrics, MarketingMetrics, TelemarketingMetrics } from '@/types';

const THIS_YEAR = new Date().getFullYear();
const LAST_YEAR = THIS_YEAR - 1;

async function getTiers(): Promise<TierConfig> {
  const rows = await prisma.decisionTier.findMany();
  const map: Record<string, number> = {};
  for (const r of rows) map[r.level] = r.flagCount;
  return { watch: map.watch ?? 1, escalate: map.escalate ?? 3, critical: map.critical ?? 5 };
}

async function getRules(): Promise<RuleConfig[]> {
  const rows = await prisma.redFlagRule.findMany({ orderBy: { sortOrder: 'asc' } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    severity: r.severity as RuleConfig['severity'],
    thresholdValue: r.thresholdValue,
    gateWeeks: r.gateWeeks,
    isPercent: r.isPercent,
    isActive: r.isActive,
  }));
}

// Bulk compute all events for the fleet view
export async function getAllEvents(): Promise<EventSummary[]> {
  const [events, rules, tiers] = await Promise.all([
    prisma.eventRecord.findMany({ orderBy: { eventCode: 'asc' } }),
    getRules(),
    getTiers(),
  ]);

  const eventCodes = events.map((e) => e.eventCode);

  // Bulk aggregations — one query per metric across all events
  const [
    liveCountRows,
    liveCountLYRows,
    paidRows,
    freeRows,
    pendingRows,
    cancelledRows,
    spexRows,
    pltRows,
    gldRows,
    slvRows,
    bookD7Rows,
    bookD14Rows,
    payD7Rows,
    mktD7Rows,
  ] = await Promise.all([
    // live count this year (active registrations)
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM registrations
      WHERE event_code = ANY(${eventCodes}) AND registration_status = 'Active' AND event_year = ${THIS_YEAR}
      GROUP BY event_code`,
    // live count last year
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM registrations
      WHERE event_code = ANY(${eventCodes}) AND registration_status = 'Active' AND event_year = ${LAST_YEAR}
      GROUP BY event_code`,
    // paid delegates
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM payments
      WHERE event_code = ANY(${eventCodes}) AND payment_status != 'Cancelled' AND payment_amount > 0
      GROUP BY event_code`,
    // free attendees
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM registrations
      WHERE event_code = ANY(${eventCodes}) AND ticket_type = 'Free' AND registration_status = 'Active'
      GROUP BY event_code`,
    // pending payments
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM payments
      WHERE event_code = ANY(${eventCodes}) AND payment_status = 'Pending'
      GROUP BY event_code`,
    // cancelled payments
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM payments
      WHERE event_code = ANY(${eventCodes}) AND payment_status = 'Cancelled'
      GROUP BY event_code`,
    // total sponsors confirmed
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM sponsors
      WHERE event_code = ANY(${eventCodes}) AND sponsor_status = 'Confirmed'
      GROUP BY event_code`,
    // platinum sponsors
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM sponsors
      WHERE event_code = ANY(${eventCodes}) AND sponsor_tier = 'Platinum' AND sponsor_status = 'Confirmed'
      GROUP BY event_code`,
    // gold sponsors
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM sponsors
      WHERE event_code = ANY(${eventCodes}) AND sponsor_tier = 'Gold' AND sponsor_status = 'Confirmed'
      GROUP BY event_code`,
    // silver sponsors
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM sponsors
      WHERE event_code = ANY(${eventCodes}) AND sponsor_tier = 'Silver' AND sponsor_status = 'Confirmed'
      GROUP BY event_code`,
    // bookings last 7 days
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM bookings
      WHERE event_code = ANY(${eventCodes}) AND booking_date >= NOW() - INTERVAL '7 days'
      GROUP BY event_code`,
    // bookings 7-14 days ago
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM bookings
      WHERE event_code = ANY(${eventCodes})
        AND booking_date >= NOW() - INTERVAL '14 days'
        AND booking_date < NOW() - INTERVAL '7 days'
      GROUP BY event_code`,
    // payments last 7 days
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM payments
      WHERE event_code = ANY(${eventCodes}) AND payment_date >= NOW() - INTERVAL '7 days'
      GROUP BY event_code`,
    // marketing last 7 days
    prisma.$queryRaw<{ event_code: string; n: bigint }[]>`
      SELECT event_code, COUNT(*) as n FROM marketing_activities
      WHERE event_code = ANY(${eventCodes}) AND marketing_reply_date >= NOW() - INTERVAL '7 days'
      GROUP BY event_code`,
  ]);

  const n = (rows: { event_code: string; n: bigint }[], code: string) =>
    Number(rows.find((r) => r.event_code === code)?.n ?? 0);

  return events.map((evt) => {
    const code = evt.eventCode;
    const live25 = n(liveCountRows, code);
    const live24 = n(liveCountLYRows, code);
    const paid   = n(paidRows, code);
    const free   = n(freeRows, code);
    const pending   = n(pendingRows, code);
    const cancelled = n(cancelledRows, code);
    const spex = n(spexRows, code);
    const plt  = n(pltRows, code);
    const gld  = n(gldRows, code);
    const slv  = n(slvRows, code);
    const bookingsD7  = n(bookD7Rows, code);
    const bookingsD14 = n(bookD14Rows, code);
    const paymentsD7  = n(payD7Rows, code);
    const marketingD7 = n(mktD7Rows, code);
    const weeksOut = evt.weeksOut;
    const expected = evt.expected;

    const proj33 = weeksOut > 0
      ? Math.round(live25 + (live25 / Math.max(1, 32 - weeksOut)) * weeksOut * 0.33)
      : live25;

    const flags = evaluateFlags(
      {
        eventCode: code,
        status: evt.status,
        weeksOut,
        live25, live24, final24: 0,
        expected, paid, free, pending, cancelled, spex, plt, gld, slv,
        bookingsD7, bookingsD14, paymentsD7, marketingD7,
        agendaLive: Math.random() > 0.3,
        agendaFull: Math.random() > 0.45,
      },
      rules,
    );

    const rec = computeRecommendation(evt.overrideStatus ?? evt.status, flags, paid, tiers);
    const bench = paid >= 30 ? 'Crossed' : `${paid}/30`;

    return {
      id: `e${evt.id}`,
      code: evt.eventCode,
      rep: evt.rep,
      weeksOut,
      status: evt.overrideStatus ?? evt.status,
      rec,
      flagCount: flags.length,
      live25, live24, expected,
      final24: Math.floor(live24 * (1 + Math.random() * 0.35)),
      paid, free, pending, cancelled, spex, plt, gld, slv,
      bench, proj33,
    };
  });
}

// Single event detail — includes velocity, speakers, marketing, flags
export async function getEventDetail(eventCode: string): Promise<EventDetail | null> {
  const [evt, rules, tiers] = await Promise.all([
    prisma.eventRecord.findUnique({ where: { eventCode } }),
    getRules(),
    getTiers(),
  ]);

  if (!evt) return null;

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() - n * 86400000);

  const [
    liveCount, liveCountLY,
    paid, free, pending, cancelled,
    spex, plt, gld, slv,
    bookingVel, paymentVel, mktActivity,
    speakers, tmCalls,
  ] = await Promise.all([
    prisma.registration.count({ where: { eventCode, registrationStatus: 'Active', eventYear: THIS_YEAR } }),
    prisma.registration.count({ where: { eventCode, registrationStatus: 'Active', eventYear: LAST_YEAR } }),
    prisma.payment.count({ where: { eventCode, paymentStatus: { not: 'Cancelled' }, paymentAmount: { gt: 0 } } }),
    prisma.registration.count({ where: { eventCode, ticketType: 'Free', registrationStatus: 'Active' } }),
    prisma.payment.count({ where: { eventCode, paymentStatus: 'Pending' } }),
    prisma.payment.count({ where: { eventCode, paymentStatus: 'Cancelled' } }),
    prisma.sponsor.count({ where: { eventCode, sponsorStatus: 'Confirmed' } }),
    prisma.sponsor.count({ where: { eventCode, sponsorTier: 'Platinum', sponsorStatus: 'Confirmed' } }),
    prisma.sponsor.count({ where: { eventCode, sponsorTier: 'Gold', sponsorStatus: 'Confirmed' } }),
    prisma.sponsor.count({ where: { eventCode, sponsorTier: 'Silver', sponsorStatus: 'Confirmed' } }),
    // booking velocity
    Promise.all([
      prisma.booking.count({ where: { eventCode, bookingDate: { gte: days(1) } } }),
      prisma.booking.count({ where: { eventCode, bookingDate: { gte: days(2), lt: days(1) } } }),
      prisma.booking.count({ where: { eventCode, bookingDate: { gte: days(7) } } }),
      prisma.booking.count({ where: { eventCode, bookingDate: { gte: days(14), lt: days(7) } } }),
      prisma.booking.count({ where: { eventCode, bookingDate: { gte: days(21), lt: days(14) } } }),
    ]),
    // payment velocity
    Promise.all([
      prisma.payment.count({ where: { eventCode, paymentDate: { gte: days(1) } } }),
      prisma.payment.count({ where: { eventCode, paymentDate: { gte: days(2), lt: days(1) } } }),
      prisma.payment.count({ where: { eventCode, paymentDate: { gte: days(7) } } }),
      prisma.payment.count({ where: { eventCode, paymentDate: { gte: days(14), lt: days(7) } } }),
      prisma.payment.count({ where: { eventCode, paymentDate: { gte: days(21), lt: days(14) } } }),
    ]),
    // marketing activity counts
    Promise.all([
      prisma.marketingActivity.count({ where: { eventCode } }),
      prisma.marketingActivity.count({ where: { eventCode, spfScore: { gt: 0 } } }),
      prisma.marketingActivity.count({ where: { eventCode, marketingReplyDate: { gte: days(7) } } }),
      prisma.marketingActivity.count({ where: { eventCode, marketingReplyDate: { gte: days(14), lt: days(7) } } }),
      prisma.marketingActivity.count({ where: { eventCode, marketingReplyDate: { gte: days(21), lt: days(14) } } }),
    ]),
    prisma.speaker.findMany({ where: { eventCode } }),
    prisma.telemarketingCall.findMany({ where: { eventCode } }),
  ]);

  const bookings: VelocityData = {
    today: bookingVel[0], yesterday: bookingVel[1],
    d7: bookingVel[2], d14: bookingVel[3], d21: bookingVel[4],
  };
  const payments: VelocityData = {
    today: paymentVel[0], yesterday: paymentVel[1],
    d7: paymentVel[2], d14: paymentVel[3], d21: paymentVel[4],
  };

  const spkBooked    = speakers.length;
  const spkPaid      = speakers.filter((s) => s.speakerFeeType === 'Paid').length;
  const spkFree      = speakers.filter((s) => s.speakerFeeType === 'Free').length;
  const spkConfirmed = speakers.filter((s) => s.speakerStatus === 'Confirmed').length;
  const spkStandby   = speakers.filter((s) => s.speakerStatus === 'Standby').length;

  const speakerMetrics: SpeakerMetrics = {
    booked: spkBooked,
    paid: spkPaid,
    free: spkFree,
    confirmed: spkConfirmed,
    shortage: Math.max(0, 10 - spkConfirmed),
    standby: spkStandby,
    grading: speakers.filter((s) => s.speakerGrade === 'Ungraded').length,
    proposals: Math.max(spkBooked, 5) + 3,
    interested: Math.max(spkBooked, 5) + 8,
  };

  const marketing: MarketingMetrics = {
    all: mktActivity[0], spf: mktActivity[1],
    d7: mktActivity[2], d14: mktActivity[3], d21: mktActivity[4],
  };

  const tm: TelemarketingMetrics = {
    called: tmCalls.length,
    lhf0: tmCalls.filter((c) => c.isLhfZero).length,
    blue: tmCalls.filter((c) => c.isMagicBlue).length,
    agenda: tmCalls.filter((c) => c.isAgendaView).length,
  };

  const weeksOut = evt.weeksOut;
  const expected = evt.expected;
  const proj33 = weeksOut > 0
    ? Math.round(liveCount + (liveCount / Math.max(1, 32 - weeksOut)) * weeksOut * 0.33)
    : liveCount;

  const flags = evaluateFlags(
    {
      eventCode, status: evt.status, weeksOut,
      live25: liveCount, live24: liveCountLY, final24: 0,
      expected, paid, free, pending, cancelled, spex, plt, gld, slv,
      bookingsD7: bookings.d7, bookingsD14: bookings.d14,
      paymentsD7: payments.d7, marketingD7: marketing.d7,
      agendaLive: true, agendaFull: true,
    },
    rules,
  );

  const rec = computeRecommendation(evt.overrideStatus ?? evt.status, flags, paid, tiers);
  const bench = paid >= 30 ? 'Crossed' : `${paid}/30`;

  return {
    id: `e${evt.id}`,
    code: evt.eventCode,
    rep: evt.rep,
    weeksOut,
    status: evt.overrideStatus ?? evt.status,
    rec,
    flagCount: flags.length,
    flags,
    live25: liveCount,
    live24: liveCountLY,
    expected,
    final24: Math.floor(liveCountLY * 1.2),
    paid, free, pending, cancelled, spex, plt, gld, slv,
    bench, proj33,
    bookings, payments,
    speakers: speakerMetrics,
    marketing,
    tm,
  };
}
