// Event Detail View Component
const EventDetail = ({ evt, onBack }) => {
  const [overrideStatus, setOverrideStatus] = React.useState(evt.eventStatus);
  const recColor = RECOMMENDATION_COLORS[evt.recommendation] || '#8892a4';

  const KPI = ({ label, value, sub, warn, large }) => React.createElement('div', {
    style: { background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 8, padding: large ? '20px 24px' : '14px 18px' }
  },
    React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 10, color: '#586374', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 } }, label),
    React.createElement('div', { style: { fontFamily: 'JetBrains Mono', fontSize: large ? 32 : 22, fontWeight: 700, color: warn || '#e1e4e8' } }, value),
    sub && React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374', marginTop: 4 } }, sub)
  );

  const Section = ({ title, children, cols }) => React.createElement('div', { style: { marginBottom: 24 } },
    React.createElement('h3', { style: { fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#8892a4', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 } }, title),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: cols || 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 } }, children)
  );

  const VelocityChart = ({ data, label }) => {
    const keys = ['today', 'yesterday', 'd7', 'd14', 'd21'];
    const labels = ['Today', 'Yest.', '7d', '8-14d', '15-21d'];
    const max = Math.max(...keys.map(k => data[k]), 1);
    return React.createElement('div', { style: { background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 8, padding: 18 } },
      React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 10, color: '#586374', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 } }, label),
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 } },
        keys.map((k, i) => {
          const val = data[k];
          const h = Math.max((val / max) * 80, 2);
          const isRecent = i <= 1;
          return React.createElement('div', { key: k, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
            React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600, color: isRecent ? '#e1e4e8' : '#586374' } }, val),
            React.createElement('div', { style: { width: '100%', maxWidth: 40, height: h, borderRadius: 4, background: isRecent ? (val > 0 ? '#00E67640' : '#FF174430') : '#1e2a3a', border: isRecent && val > 0 ? '1px solid #00E67660' : 'none', transition: 'height 0.3s' } }),
            React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 9, color: '#586374' } }, labels[i])
          );
        })
      ),
      // Trend arrow
      React.createElement('div', { style: { marginTop: 10, textAlign: 'center' } },
        data.d7 > data.d14 ?
          React.createElement('span', { style: { fontSize: 11, color: '#00E676', fontFamily: 'Outfit' } }, '▲ Accelerating') :
          data.d7 < data.d14 ?
          React.createElement('span', { style: { fontSize: 11, color: '#FF6E40', fontFamily: 'Outfit' } }, '▼ Declining') :
          React.createElement('span', { style: { fontSize: 11, color: '#586374', fontFamily: 'Outfit' } }, '— Flat')
      )
    );
  };

  const pctOfTarget = evt.expected2025 > 0 ? Math.round(evt.liveCount2025 / evt.expected2025 * 100) : 0;
  const yoyDelta = evt.liveCount2024 > 0 ? Math.round((evt.liveCount2025 - evt.liveCount2024) / evt.liveCount2024 * 100) : 0;

  return React.createElement('div', { style: { padding: '0 32px 32px', maxWidth: 1200 } },
    // Back + header
    React.createElement('button', {
      onClick: onBack,
      style: { background: 'none', border: 'none', color: '#586374', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer', padding: '8px 0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }
    }, '← Back to Fleet'),

    // Decision Banner
    React.createElement('div', {
      style: { background: recColor + '0a', border: `1px solid ${recColor}30`, borderRadius: 12, padding: '20px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }
    },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#e1e4e8' } }, evt.eventCode),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 } },
          React.createElement('span', { style: { fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: recColor, padding: '4px 14px', background: recColor + '18', borderRadius: 6 } }, evt.recommendation),
          React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 12, color: '#586374' } }, `${evt.redFlagCount} red flag${evt.redFlagCount !== 1 ? 's' : ''}`),
          React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 12, color: '#586374' } }, `${evt.marketRep} · ${evt.weeksOut > 0 ? evt.weeksOut + 'w out' : 'Past/Current'}`)
        )
      ),
      // Management Override
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' } },
        React.createElement('label', { style: { fontFamily: 'Outfit', fontSize: 10, color: '#586374', textTransform: 'uppercase', letterSpacing: 1 } }, 'Management Override'),
        React.createElement('select', {
          value: overrideStatus, onChange: e => setOverrideStatus(e.target.value),
          style: { padding: '8px 14px', background: '#0d1320', border: `1px solid ${STATUS_COLORS[overrideStatus] || '#1e2a3a'}`, borderRadius: 6, color: STATUS_COLORS[overrideStatus] || '#e1e4e8', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }
        },
          ['Going Ahead', 'Standby', 'Postponed', 'Postpone', 'Cancelled'].map(s =>
            React.createElement('option', { key: s, value: s }, s)
          )
        )
      )
    ),

    // KPIs Row 1
    Section({ title: 'Key Performance Indicators', cols: 'repeat(auto-fill, minmax(160px, 1fr))', children: [
      KPI({ label: 'Live Count', value: evt.liveCount2025, sub: `${pctOfTarget}% of ${evt.expected2025} target`, warn: pctOfTarget < 40 ? '#FF6E40' : null, large: true }),
      KPI({ label: 'Paid Delegates', value: evt.paidHeadCount, sub: evt.paymentBenchmark === 'Crossed' ? '✓ Benchmark crossed' : evt.paymentBenchmark, warn: evt.paidHeadCount < 20 ? '#FF1744' : null, large: true }),
      KPI({ label: 'Free Attendees', value: evt.freeAttendees }),
      KPI({ label: 'Pending Payments', value: evt.pendingPayments, warn: evt.pendingPayments > 10 ? '#FFD740' : null }),
      KPI({ label: 'Cancelled', value: evt.cancelledPayments, warn: evt.cancelledPayments > 5 ? '#FF6E40' : null }),
      KPI({ label: 'YoY Delta', value: `${yoyDelta > 0 ? '+' : ''}${yoyDelta}%`, warn: yoyDelta < 0 ? '#FF6E40' : '#00E676' }),
    ]}),

    // SpEx Breakdown
    Section({ title: 'Sponsor-Exhibitor Breakdown', cols: 'repeat(4, 1fr)', children: [
      KPI({ label: 'Total SpEx', value: evt.spexTotal, warn: evt.spexTotal < 2 ? '#FF6E40' : null }),
      KPI({ label: 'Platinum', value: evt.spexPlatinum }),
      KPI({ label: 'Gold', value: evt.spexGold }),
      KPI({ label: 'Silver', value: evt.spexSilver }),
    ]}),

    // Velocity Charts
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 } },
      VelocityChart({ data: evt.bookings, label: 'Booking Velocity' }),
      VelocityChart({ data: evt.payments, label: 'Payment Velocity' }),
    ),

    // Speaker Pipeline
    Section({ title: 'Speaker Pipeline', cols: 'repeat(auto-fill, minmax(120px, 1fr))', children: [
      KPI({ label: 'Booked', value: evt.speakers.booked }),
      KPI({ label: 'Paid', value: evt.speakers.paid }),
      KPI({ label: 'Free', value: evt.speakers.free }),
      KPI({ label: 'Confirmed', value: evt.speakers.confirmed }),
      KPI({ label: 'Shortage', value: evt.speakers.shortage, warn: evt.speakers.shortage > 0 ? '#FF6E40' : null }),
      KPI({ label: 'Standby', value: evt.speakers.standby }),
      KPI({ label: 'Proposals', value: evt.speakers.proposals }),
      KPI({ label: 'Interested', value: evt.speakers.interested }),
    ]}),

    // Marketing Activity
    Section({ title: 'Marketing Activity', cols: 'repeat(auto-fill, minmax(130px, 1fr))', children: [
      KPI({ label: 'Total Replies', value: evt.marketing.all }),
      KPI({ label: 'SPF 1/2', value: evt.marketing.spf }),
      KPI({ label: 'Last 7d', value: evt.marketing.d7, warn: evt.marketing.d7 === 0 ? '#FFD740' : null }),
      KPI({ label: '8-14d', value: evt.marketing.d14 }),
      KPI({ label: '15-21d', value: evt.marketing.d21 }),
      KPI({ label: 'TM Called', value: evt.telemarketing.called }),
      KPI({ label: 'TM Blue Ticket', value: evt.telemarketing.blueTicket }),
      KPI({ label: 'TM Agenda View', value: evt.telemarketing.agendaView }),
    ]}),

    // Red Flags
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h3', { style: { fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#8892a4', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 } }, `Active Red Flags (${evt.redFlags.length})`),
      evt.redFlags.length === 0 ?
        React.createElement('div', { style: { background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 8, padding: 20, textAlign: 'center', color: '#2d6b3f', fontFamily: 'Outfit', fontSize: 13 } }, '✓ No active red flags') :
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          evt.redFlags.map((flag, i) =>
            React.createElement('div', {
              key: i,
              style: { background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 8, padding: '12px 18px', display: 'grid', gridTemplateColumns: '24px 1fr 120px 120px', alignItems: 'center', gap: 14, borderLeft: `3px solid ${SEVERITY_COLORS[flag.severity]}` }
            },
              React.createElement('span', { style: { width: 22, height: 22, borderRadius: '50%', background: SEVERITY_COLORS[flag.severity] + '22', color: SEVERITY_COLORS[flag.severity], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono' } }, flag.id.replace('RF0', '')),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#e1e4e8' } }, flag.name),
                React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374', marginTop: 2 } }, `Severity: ${flag.severity}`)
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 9, color: '#586374', textTransform: 'uppercase' } }, 'Threshold'),
                React.createElement('div', { style: { fontFamily: 'JetBrains Mono', fontSize: 12, color: '#8892a4' } }, flag.threshold)
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 9, color: '#586374', textTransform: 'uppercase' } }, 'Current'),
                React.createElement('div', { style: { fontFamily: 'JetBrains Mono', fontSize: 12, color: SEVERITY_COLORS[flag.severity] } }, flag.current)
              )
            )
          )
        )
    ),
  );
};

Object.assign(window, { EventDetail });
