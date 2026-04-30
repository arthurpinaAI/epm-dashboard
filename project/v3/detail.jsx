// EPM v3 — Event Detail (Light Premium)
const EventDetail3 = ({ evt, onBack }) => {
  const [override, setOverride] = React.useState(evt.status);
  const [tab, setTab] = React.useState('overview');
  const rm = REC_MAP[evt.rec] || { color: T.textDim, bg: T.bgSubtle };
  const pct = evt.expected > 0 ? Math.round(evt.live25 / evt.expected * 100) : 0;
  const yoy = evt.live24 > 0 ? Math.round((evt.live25 - evt.live24) / evt.live24 * 100) : 0;

  const Ring = ({ pct: p, color, sz = 52, sw = 4.5 }) => {
    const r = (sz - sw) / 2, c = 2 * Math.PI * r, off = c - (Math.min(p, 100) / 100) * c;
    return React.createElement('svg', { width: sz, height: sz, style: { transform: 'rotate(-90deg)' } },
      React.createElement('circle', { cx: sz/2, cy: sz/2, r, fill: 'none', stroke: T.border, strokeWidth: sw }),
      React.createElement('circle', { cx: sz/2, cy: sz/2, r, fill: 'none', stroke: color, strokeWidth: sw, strokeDasharray: c, strokeDashoffset: off, strokeLinecap: 'round', style: { transition: 'stroke-dashoffset 0.7s ease' } }),
    );
  };

  const tabs = [['overview','Overview'],['speakers','Speakers'],['marketing','Marketing'],['flags',`Flags (${evt.flagCount})`]];

  return React.createElement('div', { style: { padding: '0 36px 40px', maxWidth: 1240 } },
    React.createElement('button', { onClick: onBack, style: { background: 'none', border: 'none', color: T.textDim, fontFamily: T.sans, fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '6px 0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.15s' }, onMouseEnter: e => e.target.style.color = T.text, onMouseLeave: e => e.target.style.color = T.textDim }, '← Fleet'),

    // Banner
    React.createElement(Fade, null,
      React.createElement('div', { style: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 30px', marginBottom: 24, boxShadow: T.shadow1 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 } },
          React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 } },
              React.createElement('span', { style: { fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: -0.3 } }, evt.code),
              React.createElement(StatusBadge, { rec: evt.rec }),
            ),
            React.createElement('div', { style: { display: 'flex', gap: 20, flexWrap: 'wrap' } },
              [[`${evt.flagCount} flag${evt.flagCount !== 1 ? 's' : ''}`, evt.flagCount > 0 ? T.escalate : T.go],
               [evt.rep, T.textMid],
               [evt.weeksOut > 0 ? `${evt.weeksOut} weeks out` : 'Past/Current', T.textMid],
               [evt.bench === 'Crossed' ? '✓ Benchmark' : evt.bench, evt.bench === 'Crossed' ? T.go : T.textDim],
              ].map(([t, c], i) => React.createElement('span', { key: i, style: { fontFamily: T.sans, fontSize: 12, color: c, fontWeight: 500 } }, t)),
            ),
          ),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' } },
            React.createElement('label', { style: { fontFamily: T.sans, fontSize: 10, color: T.textFaint, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' } }, 'Management Override'),
            React.createElement('select', {
              value: override, onChange: e => setOverride(e.target.value),
              style: { padding: '9px 16px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 10, color: STATUS_MAP[override] || T.text, fontFamily: T.sans, fontWeight: 650, fontSize: 13, cursor: 'pointer' }
            }, ['Going Ahead','Standby','Postponed','Postpone','Cancelled'].map(s => React.createElement('option', { key: s, value: s }, s))),
          ),
        ),
      ),
    ),

    // Tabs
    React.createElement('div', { style: { display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${T.border}` } },
      tabs.map(([id, label]) => React.createElement('button', {
        key: id, onClick: () => setTab(id),
        style: { padding: '10px 22px', fontFamily: T.sans, fontSize: 12, fontWeight: 600, background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? T.accent : 'transparent'}`, color: tab === id ? T.text : T.textDim, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.2 }
      }, label)),
    ),

    // Overview
    tab === 'overview' && React.createElement(Fade, null,
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10, marginBottom: 28 } },
        // Live count with ring
        React.createElement('div', { style: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 22px', boxShadow: T.shadow1 } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 8 } }, 'Live Count'),
              React.createElement('div', { style: { fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.text, letterSpacing: -0.5 } }, evt.live25),
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 11, color: T.textDim, marginTop: 6 } }, `${pct}% of ${evt.expected}`),
            ),
            React.createElement('div', { style: { position: 'relative' } },
              React.createElement(Ring, { pct, color: pct >= 80 ? T.go : pct >= 40 ? T.watch : T.critical }),
              React.createElement('span', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.text } }, `${pct}%`),
            ),
          ),
        ),
        React.createElement(Metric, { label: 'Paid Delegates', value: evt.paid, sub: evt.bench === 'Crossed' ? '✓ Benchmark' : evt.bench, warn: evt.paid < 20 ? T.critical : null, large: true }),
        React.createElement(Metric, { label: 'Free Attendees', value: evt.free }),
        React.createElement(Metric, { label: 'Pending', value: evt.pending, warn: evt.pending > 10 ? T.watch : null }),
        React.createElement(Metric, { label: 'Cancelled', value: evt.cancelled, warn: evt.cancelled > 5 ? T.escalate : null }),
        React.createElement(Metric, { label: 'YoY Delta', value: `${yoy > 0 ? '+' : ''}${yoy}%`, warn: yoy < 0 ? T.escalate : T.go }),
        React.createElement(Metric, { label: '33% Projection', value: evt.proj33, sub: `Target: ${evt.expected}` }),
      ),

      // SpEx
      React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement(SectionHead, { title: 'Sponsor-Exhibitors' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 } },
          React.createElement(Metric, { label: 'Total', value: evt.spex, warn: evt.spex < 2 ? T.escalate : null }),
          React.createElement(Metric, { label: 'Platinum', value: evt.plt }),
          React.createElement(Metric, { label: 'Gold', value: evt.gld }),
          React.createElement(Metric, { label: 'Silver', value: evt.slv }),
        ),
      ),

      // Velocity
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 } },
        React.createElement(VelChart, { data: evt.bookings, label: 'Booking Velocity' }),
        React.createElement(VelChart, { data: evt.payments, label: 'Payment Velocity' }),
      ),

      // YoY
      React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement(SectionHead, { title: 'Year-over-Year' }),
        React.createElement('div', { style: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, boxShadow: T.shadow1 } },
          [['2025 Live', evt.live25, T.accent], ['2024 Live', evt.live24, T.textMid], ['2024 Final', evt.final24, T.textDim], ['YoY %', `${yoy > 0 ? '+' : ''}${yoy}%`, yoy >= 0 ? T.go : T.critical]].map(([l, v, c]) =>
            React.createElement('div', { key: l },
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 10, color: T.textFaint, fontWeight: 600, letterSpacing: 0.3 } }, l),
              React.createElement('div', { style: { fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: c, marginTop: 4, letterSpacing: -0.3 } }, v),
            ),
          ),
        ),
      ),
    ),

    // Speakers
    tab === 'speakers' && React.createElement(Fade, null,
      React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement(SectionHead, { title: 'Speaker Pipeline' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(125px, 1fr))', gap: 10 } },
          [['Booked',evt.speakers.booked],['Paid',evt.speakers.paid],['Free',evt.speakers.free],['Confirmed',evt.speakers.confirmed],['Shortage',evt.speakers.shortage,evt.speakers.shortage>0?T.escalate:null],['Standby',evt.speakers.standby],['Grading',evt.speakers.grading],['Proposals',evt.speakers.proposals],['Interested',evt.speakers.interested]].map(([l,v,w])=>
            React.createElement(Metric, { key: l, label: l, value: v, warn: w })
          ),
        ),
      ),
      // Funnel
      React.createElement('div', { style: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, boxShadow: T.shadow1 } },
        React.createElement('div', { style: { fontFamily: T.sans, fontSize: 13, fontWeight: 650, color: T.textMid, marginBottom: 18 } }, 'Pipeline Funnel'),
        React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 } },
          [['Interested',evt.speakers.interested,T.accent],['Proposals',evt.speakers.proposals,T.accentLight],['Booked',evt.speakers.booked,T.watch],['Confirmed',evt.speakers.confirmed,T.go]].map(([l,v,c])=>{
            const mx=Math.max(evt.speakers.interested,1);
            return React.createElement('div',{key:l,style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}},
              React.createElement('span',{style:{fontFamily:T.mono,fontSize:14,fontWeight:700,color:c}},v),
              React.createElement('div',{style:{width:'65%',height:Math.max((v/mx)*40,4),background:c+'20',borderRadius:6,border:`1px solid ${c}30`,transition:'height 0.4s'}}),
              React.createElement('span',{style:{fontFamily:T.sans,fontSize:9,color:T.textFaint,fontWeight:500}},l),
            );
          }),
        ),
      ),
    ),

    // Marketing
    tab === 'marketing' && React.createElement(Fade, null,
      React.createElement('div', { style: { marginBottom: 28 } },
        React.createElement(SectionHead, { title: 'Marketing Activity' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: 10 } },
          [['Total Replies',evt.marketing.all],['SPF 1/2',evt.marketing.spf],['Last 7d',evt.marketing.d7,evt.marketing.d7===0?T.watch:null],['8-14d',evt.marketing.d14],['15-21d',evt.marketing.d21]].map(([l,v,w])=>React.createElement(Metric,{key:l,label:l,value:v,warn:w})),
        ),
      ),
      React.createElement('div', null,
        React.createElement(SectionHead, { title: 'Telemarketing' }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 } },
          [['Called',evt.tm.called],['LHF 0',evt.tm.lhf0],['Blue Ticket',evt.tm.blue],['Agenda View',evt.tm.agenda]].map(([l,v])=>React.createElement(Metric,{key:l,label:l,value:v})),
        ),
      ),
    ),

    // Flags
    tab === 'flags' && React.createElement(Fade, null,
      evt.flags.length === 0 ?
        React.createElement('div', { style: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: T.shadow1 } },
          React.createElement('div', { style: { width: 40, height: 40, borderRadius: 20, background: T.goBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 } }, '✓'),
          React.createElement('div', { style: { fontFamily: T.sans, fontSize: 14, color: T.go, fontWeight: 650 } }, 'No active red flags'),
        ) :
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          evt.flags.map((f, i) => React.createElement(Fade, { key: i, delay: i * 50 },
            React.createElement('div', { style: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 20px', display: 'grid', gridTemplateColumns: '30px 1fr 130px 130px', alignItems: 'center', gap: 14, boxShadow: T.shadow1, borderLeft: `3px solid ${SEV_MAP[f.sev]}` } },
              React.createElement('div', { style: { width: 26, height: 26, borderRadius: 8, background: (SEV_MAP[f.sev] || T.textDim) + '10', color: SEV_MAP[f.sev], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: T.mono } }, f.id.replace('RF0','')),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: T.sans, fontSize: 13, fontWeight: 650, color: T.text } }, f.name),
                React.createElement('div', { style: { fontFamily: T.sans, fontSize: 11, color: T.textDim, marginTop: 2, fontWeight: 500 } }, f.sev),
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textFaint, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' } }, 'Threshold'),
                React.createElement('div', { style: { fontFamily: T.mono, fontSize: 13, color: T.textMid, fontWeight: 500 } }, f.thresh),
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textFaint, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' } }, 'Actual'),
                React.createElement('div', { style: { fontFamily: T.mono, fontSize: 13, color: SEV_MAP[f.sev], fontWeight: 600 } }, f.cur),
              ),
            ),
          )),
        ),
    ),
  );
};

Object.assign(window, { EventDetail3 });
