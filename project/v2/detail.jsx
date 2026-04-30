// EPM v2 — Event Detail View
const EventDetail = ({ evt, onBack }) => {
  const [override, setOverride] = React.useState(evt.status);
  const [activeTab, setActiveTab] = React.useState('overview');
  const rc = REC_COLORS[evt.rec] || C.textDim;
  const pct = evt.expected > 0 ? Math.round(evt.live25 / evt.expected * 100) : 0;
  const yoy = evt.live24 > 0 ? Math.round((evt.live25 - evt.live24) / evt.live24 * 100) : 0;

  const tabs = ['overview','speakers','marketing','flags'];
  const tabLabel = { overview: 'Overview', speakers: 'Speakers', marketing: 'Marketing', flags: `Flags (${evt.flagCount})` };

  const ProgressRing = ({ pct, color, size = 56, stroke = 5 }) => {
    const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(pct, 100) / 100) * circ;
    return React.createElement('svg', { width: size, height: size, style: { transform: 'rotate(-90deg)' } },
      React.createElement('circle', { cx: size/2, cy: size/2, r, fill: 'none', stroke: C.border, strokeWidth: stroke }),
      React.createElement('circle', { cx: size/2, cy: size/2, r, fill: 'none', stroke: color, strokeWidth: stroke, strokeDasharray: circ, strokeDashoffset: offset, strokeLinecap: 'round', style: { transition: 'stroke-dashoffset 0.8s ease' } }),
    );
  };

  const MiniSpark = ({ values, color = C.accent, w = 80, h = 28 }) => {
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4)}`).join(' ');
    return React.createElement('svg', { width: w, height: h, style: { display: 'block' } },
      React.createElement('polyline', { points: pts, fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinejoin: 'round' }),
    );
  };

  return React.createElement('div', { style: { padding: '0 32px 40px', maxWidth: 1280 } },
    // Back
    React.createElement('button', { onClick: onBack, style: { background: 'none', border: 'none', color: C.textDim, fontFamily: "'Space Grotesk'", fontSize: 12, cursor: 'pointer', padding: '8px 0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }, onMouseEnter: e => e.target.style.color = C.text, onMouseLeave: e => e.target.style.color = C.textDim }, '← Fleet View'),

    // Decision Banner
    React.createElement(FadeIn, null,
      React.createElement('div', { style: { background: `linear-gradient(135deg, ${rc}08 0%, ${C.bg2} 100%)`, border: `1px solid ${rc}25`, borderRadius: 14, padding: '24px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' } },
        React.createElement(Glow, { color: rc, size: 200, style: { top: -60, right: -40, opacity: 0.4 } }),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, position: 'relative' } },
          React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 } },
              React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 24, fontWeight: 700, color: C.text } }, evt.code),
              React.createElement(Badge, { label: evt.rec, color: rc, size: 'lg' }),
            ),
            React.createElement('div', { style: { display: 'flex', gap: 20, alignItems: 'center' } },
              [
                [`${evt.flagCount} flag${evt.flagCount !== 1 ? 's' : ''}`, evt.flagCount > 0 ? C.escalate : C.go],
                [evt.rep, C.textMid],
                [evt.weeksOut > 0 ? `${evt.weeksOut} weeks out` : 'Past/Current', C.textMid],
                [evt.bench === 'Crossed' ? '✓ Benchmark' : evt.bench, evt.bench === 'Crossed' ? C.go : C.textDim],
              ].map(([t, c], i) => React.createElement('span', { key: i, style: { fontFamily: "'Space Grotesk'", fontSize: 12, color: c } }, t)),
            ),
          ),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' } },
            React.createElement('label', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5 } }, 'Management Override'),
            React.createElement('select', {
              value: override, onChange: e => setOverride(e.target.value),
              style: { padding: '10px 16px', background: C.bg1, border: `1px solid ${STATUS_COLORS[override] || C.border}`, borderRadius: 8, color: STATUS_COLORS[override] || C.text, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, cursor: 'pointer' }
            }, ['Going Ahead','Standby','Postponed','Postpone','Cancelled'].map(s => React.createElement('option', { key: s, value: s }, s))),
          ),
        ),
      ),
    ),

    // Tab bar
    React.createElement('div', { style: { display: 'flex', gap: 2, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 } },
      tabs.map(t => React.createElement('button', {
        key: t, onClick: () => setActiveTab(t),
        style: { padding: '10px 20px', fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t ? C.accent : 'transparent'}`, color: activeTab === t ? C.text : C.textDim, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.3 }
      }, tabLabel[t])),
    ),

    // Overview tab
    activeTab === 'overview' && React.createElement(FadeIn, null,
      // KPIs with progress ring
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginBottom: 28 } },
        React.createElement('div', { style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 22px', position: 'relative', overflow: 'hidden' } },
          React.createElement(Glow, { color: pct >= 80 ? C.go : pct >= 40 ? C.watch : C.critical, size: 60, style: { bottom: -10, right: -10 } }),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 } }, 'Live Count'),
              React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: 34, fontWeight: 700, color: C.text } }, evt.live25),
              React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 4 } }, `${pct}% of ${evt.expected}`),
            ),
            React.createElement('div', { style: { position: 'relative' } },
              React.createElement(ProgressRing, { pct, color: pct >= 80 ? C.go : pct >= 40 ? C.watch : C.critical }),
              React.createElement('span', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700, color: C.text } }, `${pct}%`),
            ),
          ),
        ),
        React.createElement(KPITile, { label: 'Paid Delegates', value: evt.paid, sub: evt.bench === 'Crossed' ? '✓ Benchmark' : evt.bench, warn: evt.paid < 20 ? C.critical : null, big: true, glow: true }),
        React.createElement(KPITile, { label: 'Free Attendees', value: evt.free }),
        React.createElement(KPITile, { label: 'Pending', value: evt.pending, warn: evt.pending > 10 ? C.watch : null }),
        React.createElement(KPITile, { label: 'Cancelled', value: evt.cancelled, warn: evt.cancelled > 5 ? C.escalate : null }),
        React.createElement(KPITile, { label: 'YoY Delta', value: `${yoy > 0 ? '+' : ''}${yoy}%`, warn: yoy < 0 ? C.escalate : C.go }),
        React.createElement(KPITile, { label: '33% Projection', value: evt.proj33, sub: `Target: ${evt.expected}` }),
      ),

      // SpEx
      React.createElement(Section, { title: 'Sponsor-Exhibitor Breakdown', cols: 'repeat(4, 1fr)' },
        React.createElement(KPITile, { label: 'Total', value: evt.spex, warn: evt.spex < 2 ? C.escalate : null }),
        React.createElement(KPITile, { label: 'Platinum', value: evt.plt }),
        React.createElement(KPITile, { label: 'Gold', value: evt.gld }),
        React.createElement(KPITile, { label: 'Silver', value: evt.slv }),
      ),

      // Velocity
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 } },
        React.createElement(VelocityBar, { data: evt.bookings, label: 'Booking Velocity' }),
        React.createElement(VelocityBar, { data: evt.payments, label: 'Payment Velocity' }),
      ),

      // YoY comparison
      React.createElement(Section, { title: 'Year-over-Year' },
        React.createElement('div', { style: { gridColumn: '1 / -1', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 } },
          [['2025 Live', evt.live25, C.accent], ['2024 Live', evt.live24, C.textMid], ['2024 Final', evt.final24, C.textDim], ['YoY %', `${yoy > 0 ? '+' : ''}${yoy}%`, yoy >= 0 ? C.go : C.critical]].map(([l, v, c]) =>
            React.createElement('div', { key: l },
              React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 } }, l),
              React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 700, color: c, marginTop: 4 } }, v),
            ),
          ),
        ),
      ),
    ),

    // Speakers tab
    activeTab === 'speakers' && React.createElement(FadeIn, null,
      React.createElement(Section, { title: 'Speaker Pipeline', cols: 'repeat(auto-fill, minmax(130px, 1fr))' },
        ...[['Booked', evt.speakers.booked], ['Paid', evt.speakers.paid], ['Free', evt.speakers.free], ['Confirmed', evt.speakers.confirmed], ['Shortage', evt.speakers.shortage, evt.speakers.shortage > 0 ? C.escalate : null], ['Standby', evt.speakers.standby], ['Grading Pending', evt.speakers.grading], ['Proposals', evt.speakers.proposals], ['Interested', evt.speakers.interested]].map(([l, v, w]) =>
          React.createElement(KPITile, { key: l, label: l, value: v, warn: w })
        ),
      ),
      // Pipeline funnel visual
      React.createElement('div', { style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginTop: 4 } },
        React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 } }, 'Pipeline Funnel'),
        React.createElement('div', { style: { display: 'flex', gap: 4, alignItems: 'flex-end', height: 50 } },
          [['Interested', evt.speakers.interested, C.accent], ['Proposals', evt.speakers.proposals, C.accent + 'cc'], ['Booked', evt.speakers.booked, C.watch], ['Confirmed', evt.speakers.confirmed, C.go]].map(([l, v, c]) => {
            const maxV = Math.max(evt.speakers.interested, 1);
            return React.createElement('div', { key: l, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
              React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700, color: c } }, v),
              React.createElement('div', { style: { width: '80%', height: Math.max((v / maxV) * 36, 4), background: c, borderRadius: 4, transition: 'height 0.5s ease' } }),
              React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim } }, l),
            );
          }),
        ),
      ),
    ),

    // Marketing tab
    activeTab === 'marketing' && React.createElement(FadeIn, null,
      React.createElement(Section, { title: 'Marketing Activity', cols: 'repeat(auto-fill, minmax(140px, 1fr))' },
        ...[['Total Replies', evt.marketing.all], ['SPF 1/2', evt.marketing.spf], ['Last 7d', evt.marketing.d7, evt.marketing.d7 === 0 ? C.watch : null], ['8-14d', evt.marketing.d14], ['15-21d', evt.marketing.d21]].map(([l, v, w]) =>
          React.createElement(KPITile, { key: l, label: l, value: v, warn: w })
        ),
      ),
      React.createElement(Section, { title: 'Telemarketing', cols: 'repeat(4, 1fr)' },
        ...[['Called', evt.tm.called], ['LHF 0', evt.tm.lhf0], ['Blue Ticket', evt.tm.blue], ['Agenda View', evt.tm.agenda]].map(([l, v]) =>
          React.createElement(KPITile, { key: l, label: l, value: v })
        ),
      ),
    ),

    // Flags tab
    activeTab === 'flags' && React.createElement(FadeIn, null,
      evt.flags.length === 0 ?
        React.createElement('div', { style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 28, marginBottom: 8 } }, '✓'),
          React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 14, color: C.go, fontWeight: 600 } }, 'No active red flags'),
        ) :
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          evt.flags.map((f, i) => React.createElement(FadeIn, { key: i, delay: i * 60 },
            React.createElement('div', { style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 20px', display: 'grid', gridTemplateColumns: '28px 1fr 130px 130px', alignItems: 'center', gap: 16, borderLeft: `3px solid ${SEV_COLORS[f.sev]}` } },
              React.createElement('div', { style: { width: 26, height: 26, borderRadius: 7, background: SEV_COLORS[f.sev] + '15', color: SEV_COLORS[f.sev], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono'" } }, f.id.replace('RF0', '')),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: C.text } }, f.name),
                React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 2 } }, f.sev),
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 } }, 'Threshold'),
                React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: 13, color: C.textMid } }, f.thresh),
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1 } }, 'Actual'),
                React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: 13, color: SEV_COLORS[f.sev], fontWeight: 600 } }, f.cur),
              ),
            ),
          )),
        ),
    ),
  );
};

Object.assign(window, { EventDetail });
