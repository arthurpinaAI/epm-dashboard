// EPM v3 — Fleet View (Refined)
const FleetView3 = ({ events }) => {
  const [search, setSearch] = React.useState('');
  const [filterRec, setFilterRec] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [filterRep, setFilterRep] = React.useState('ALL');
  const [sortBy, setSortBy] = React.useState('severity');
  const [expandedId, setExpandedId] = React.useState(null);

  const filtered = React.useMemo(() => {
    let l = [...events];
    if (search) { const s = search.toLowerCase(); l = l.filter(e => e.code.toLowerCase().includes(s) || e.rep.toLowerCase().includes(s)); }
    if (filterRec !== 'ALL') l = l.filter(e => e.rec === filterRec || (filterRec === 'GO' && e.rec.startsWith('GO')));
    if (filterStatus !== 'ALL') l = l.filter(e => e.status === filterStatus);
    if (filterRep !== 'ALL') l = l.filter(e => e.rep === filterRep);
    l.sort((a, b) => {
      if (sortBy === 'severity') return REC_ORDER.indexOf(a.rec) - REC_ORDER.indexOf(b.rec);
      if (sortBy === 'flags') return b.flagCount - a.flagCount;
      if (sortBy === 'weeks') return a.weeksOut - b.weeksOut;
      if (sortBy === 'delegates') return a.paid - b.paid;
      return 0;
    });
    return l;
  }, [events, search, filterRec, filterStatus, filterRep, sortBy]);

  const counts = React.useMemo(() => {
    const c = { ALL: events.length };
    events.forEach(e => { const k = e.rec.startsWith('GO') ? 'GO' : e.rec; c[k] = (c[k] || 0) + 1; });
    return c;
  }, [events]);

  const toggleExpand = id => setExpandedId(prev => prev === id ? null : id);
  const pillKeys = [['ALL', T.textMid], ['CRITICAL', T.critical], ['ESCALATE', T.escalate], ['WATCH', T.watch], ['GO', T.go]];

  return React.createElement('div', { style: { padding: '0 32px 32px' } },
    // Top bar: search + filters inline
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' } },
      // Search
      React.createElement('div', { style: { position: 'relative', width: 220 } },
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: T.textFaint, strokeWidth: 2, strokeLinecap: 'round', style: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' } },
          React.createElement('circle', { cx: 10.5, cy: 10.5, r: 7.5 }), React.createElement('line', { x1: 21, y1: 21, x2: 15.8, y2: 15.8 }),
        ),
        React.createElement('input', {
          placeholder: 'Search…', value: search, onChange: e => setSearch(e.target.value),
          style: { width: '100%', padding: '7px 10px 7px 32px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontFamily: T.sans, fontSize: 12, fontWeight: 500, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
        }),
      ),
      // Filters
      ...[
        [filterStatus, setFilterStatus, ['ALL','Going Ahead','Standby','Postponed','Cancelled'], 'Status'],
        [filterRep, setFilterRep, ['ALL',...new Set(events.map(e=>e.rep))], 'Rep'],
        [sortBy, setSortBy, [['severity','Severity'],['flags','Flags ↓'],['weeks','Weeks ↑'],['delegates','Delegates ↑']], 'Sort'],
      ].map(([val, set, opts, label]) =>
        React.createElement('select', {
          key: label, value: val, onChange: e => set(e.target.value),
          style: { padding: '7px 10px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontFamily: T.sans, fontSize: 11, fontWeight: 500, cursor: 'pointer', outline: 'none' }
        }, opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o === 'ALL' ? `${label}: All` : o]; return React.createElement('option', { key: v, value: v }, l); }))
      ),
      // Rec pills — right side
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 4 } },
        pillKeys.map(([k, color]) => {
          const active = filterRec === k;
          const cnt = counts[k] || 0;
          return React.createElement('button', {
            key: k, onClick: () => setFilterRec(filterRec === k ? 'ALL' : k),
            style: { padding: '4px 10px', borderRadius: 4, fontSize: 10, fontFamily: T.mono, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s', background: active ? color + '0c' : 'transparent', color: active ? color : T.textFaint, border: `1px solid ${active ? color + '25' : 'transparent'}`, letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums' }
          }, `${cnt}`);
        }),
      ),
    ),

    // Table
    React.createElement('div', { style: { background: T.bgCard, borderRadius: 10, boxShadow: T.shadow2, overflow: 'hidden' } },
      // Header
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '24px 1.8fr 0.6fr 0.6fr 0.5fr 0.6fr 0.6fr 0.8fr 0.7fr', gap: 4, padding: '10px 16px', borderBottom: `1px solid ${T.border}`, background: T.bgInset } },
        ['', 'Event', 'Live', 'Paid', 'SpEx', 'Weeks', 'Flags', 'Decision', 'Status'].map(h =>
          React.createElement('span', { key: h, style: { fontFamily: T.sans, fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: 0.2 } }, h)
        ),
      ),
      // Rows
      filtered.map((evt, i) => React.createElement(EventRow, { key: evt.id, evt, expanded: expandedId === evt.id, onToggle: () => toggleExpand(evt.id), isLast: i === filtered.length - 1 })),
      // Empty state
      filtered.length === 0 && React.createElement('div', { style: { padding: 40, textAlign: 'center', color: T.textDim, fontFamily: T.sans, fontSize: 13 } }, 'No events match your filters'),
    ),

    // Count
    React.createElement('div', { style: { marginTop: 10, fontFamily: T.sans, fontSize: 11, color: T.textFaint, fontWeight: 500 } }, `${filtered.length} of ${events.length} events`),
  );
};

const EventRow = ({ evt, expanded, onToggle, isLast }) => {
  const [h, setH] = React.useState(false);
  const rm = REC_MAP[evt.rec] || {};

  return React.createElement('div', null,
    React.createElement('div', {
      onClick: onToggle, onMouseEnter: () => setH(true), onMouseLeave: () => setH(false),
      style: { display: 'grid', gridTemplateColumns: '24px 1.8fr 0.6fr 0.6fr 0.5fr 0.6fr 0.6fr 0.8fr 0.7fr', gap: 4, padding: '9px 16px', background: expanded ? T.bgHover : h ? T.bgHover : 'transparent', cursor: 'pointer', transition: 'background 0.1s', alignItems: 'center', borderBottom: expanded || isLast ? 'none' : `1px solid ${T.borderLight}` }
    },
      React.createElement('span', { style: { fontSize: 9, color: T.textFaint, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', display: 'inline-block', textAlign: 'center' } }, '›'),
      // Event
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 } },
        React.createElement('div', { style: { width: 3, height: 20, borderRadius: 2, background: rm.color || T.textFaint, flexShrink: 0 } }),
        React.createElement('span', { style: { fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.text, letterSpacing: -0.2 } }, evt.code),
        React.createElement('span', { style: { fontFamily: T.sans, fontSize: 10, color: T.textDim, fontWeight: 500 } }, evt.rep),
      ),
      // Nums
      React.createElement('span', { style: { fontFamily: T.mono, fontSize: 12, fontWeight: 500, color: T.text, fontVariantNumeric: 'tabular-nums' } }, evt.live25),
      React.createElement('span', { style: { fontFamily: T.mono, fontSize: 12, fontWeight: 500, color: evt.paid < 20 ? T.critical : T.text, fontVariantNumeric: 'tabular-nums' } }, evt.paid),
      React.createElement('span', { style: { fontFamily: T.mono, fontSize: 12, fontWeight: 500, color: evt.spex < 2 ? T.escalate : T.text, fontVariantNumeric: 'tabular-nums' } }, evt.spex),
      React.createElement('span', { style: { fontFamily: T.mono, fontSize: 11, fontWeight: 500, color: T.textDim, fontVariantNumeric: 'tabular-nums' } }, evt.weeksOut > 0 ? `${evt.weeksOut}w` : evt.weeksOut === 0 ? 'Now' : '—'),
      // Flags
      evt.flagCount > 0 ?
        React.createElement('span', { style: { fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: evt.flagCount >= 5 ? T.critical : evt.flagCount >= 3 ? T.escalate : T.watch, fontVariantNumeric: 'tabular-nums' } }, evt.flagCount) :
        React.createElement('span', { style: { fontFamily: T.mono, fontSize: 11, color: T.go, fontWeight: 500 } }, '—'),
      React.createElement(StatusBadge, { rec: evt.rec, size: 'sm' }),
      React.createElement('span', { style: { fontFamily: T.sans, fontSize: 10, color: STATUS_MAP[evt.status] || T.textDim, fontWeight: 500 } }, evt.status),
    ),

    expanded && React.createElement(InlinePanel, { evt }),
  );
};

// Inline detail panel
const InlinePanel = ({ evt }) => {
  const [override, setOverride] = React.useState(evt.status);
  const [tab, setTab] = React.useState('kpi');
  const rm = REC_MAP[evt.rec] || {};
  const pct = evt.expected > 0 ? Math.round(evt.live25 / evt.expected * 100) : 0;
  const yoy = evt.live24 > 0 ? Math.round((evt.live25 - evt.live24) / evt.live24 * 100) : 0;

  const Ring = ({ pct: p, color, sz = 36, sw = 3 }) => {
    const r = (sz - sw) / 2, c = 2 * Math.PI * r, off = c - (Math.min(p, 100) / 100) * c;
    return React.createElement('svg', { width: sz, height: sz, style: { transform: 'rotate(-90deg)' } },
      React.createElement('circle', { cx: sz/2, cy: sz/2, r, fill: 'none', stroke: T.border, strokeWidth: sw }),
      React.createElement('circle', { cx: sz/2, cy: sz/2, r, fill: 'none', stroke: color, strokeWidth: sw, strokeDasharray: c, strokeDashoffset: off, strokeLinecap: 'round', style: { transition: 'stroke-dashoffset 0.5s ease' } }),
    );
  };

  const tabs = [['kpi','KPIs'],['velocity','Velocity'],['speakers','Speakers'],['marketing','Marketing'],['flags',`Flags ${evt.flagCount}`]];
  const tabBtn = ([id, label]) => React.createElement('button', {
    key: id, onClick: () => setTab(id),
    style: { padding: '5px 12px', fontFamily: T.sans, fontSize: 10, fontWeight: 600, background: tab === id ? T.bgCard : 'transparent', border: 'none', borderRadius: 4, color: tab === id ? T.text : T.textDim, cursor: 'pointer', transition: 'all 0.12s', boxShadow: tab === id ? T.shadow1 : 'none' }
  }, label);

  return React.createElement(Fade, null,
    React.createElement('div', { style: { background: T.bgInset, padding: '14px 20px 16px 44px', borderBottom: `1px solid ${T.border}` } },
      // Header row
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          React.createElement(StatusBadge, { rec: evt.rec }),
          React.createElement('span', { style: { fontFamily: T.sans, fontSize: 11, color: T.textDim } },
            [evt.rep, evt.weeksOut > 0 ? `${evt.weeksOut}w out` : 'Past', `Bench: ${evt.bench}`].join(' · ')),
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('span', { style: { fontFamily: T.sans, fontSize: 10, color: T.textDim, fontWeight: 500 } }, 'Override'),
          React.createElement('select', { value: override, onChange: e => setOverride(e.target.value), style: { padding: '4px 8px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 5, color: STATUS_MAP[override] || T.text, fontFamily: T.sans, fontWeight: 600, fontSize: 11, cursor: 'pointer', outline: 'none' } },
            ['Going Ahead','Standby','Postponed','Postpone','Cancelled'].map(s => React.createElement('option', { key: s, value: s }, s))),
        ),
      ),

      // Tabs
      React.createElement('div', { style: { display: 'flex', gap: 2, marginBottom: 12, background: T.bgSubtle, padding: 3, borderRadius: 6, width: 'fit-content' } },
        tabs.map(tabBtn),
      ),

      // KPIs
      tab === 'kpi' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', gap: 16, marginBottom: 10 } },
          // Live with ring
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('div', { style: { position: 'relative' } },
              React.createElement(Ring, { pct, color: pct >= 80 ? T.go : pct >= 40 ? T.watch : T.critical }),
              React.createElement('span', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.text } }, `${pct}%`),
            ),
            React.createElement('div', null,
              React.createElement('div', { style: { fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: -0.5 } }, evt.live25),
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 10, color: T.textDim } }, `of ${evt.expected} target`),
            ),
          ),
          // Other KPIs as a compact row
          React.createElement('div', { style: { display: 'flex', gap: 0, flex: 1, background: T.bgCard, borderRadius: 8, boxShadow: T.shadow1, overflow: 'hidden' } },
            [['Paid', evt.paid, evt.paid < 20 ? T.critical : null],
             ['Free', evt.free, null],
             ['Pending', evt.pending, evt.pending > 10 ? T.watch : null],
             ['Cancelled', evt.cancelled, evt.cancelled > 5 ? T.escalate : null],
             ['YoY', `${yoy > 0 ? '+' : ''}${yoy}%`, yoy < 0 ? T.escalate : T.go],
             ['Proj 33%', evt.proj33, null],
            ].map(([l, v, w], i) =>
              React.createElement('div', { key: l, style: { flex: 1, padding: '10px 12px', borderRight: i < 5 ? `1px solid ${T.borderLight}` : 'none' } },
                React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textDim, fontWeight: 500, marginBottom: 3 } }, l),
                React.createElement('div', { style: { fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: w || T.text, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' } }, v),
              ),
            ),
          ),
        ),
        // SpEx + YoY
        React.createElement('div', { style: { display: 'flex', gap: 0, background: T.bgCard, borderRadius: 8, boxShadow: T.shadow1, overflow: 'hidden' } },
          [['SpEx', evt.spex, evt.spex < 2 ? T.escalate : null],['PLT', evt.plt, null],['GLD', evt.gld, null],['SLV', evt.slv, null],
           ['2025', evt.live25, T.accent],['2024', evt.live24, T.textMid],['Final 24', evt.final24, T.textDim],['YoY %', `${yoy>0?'+':''}${yoy}%`, yoy>=0?T.go:T.critical],
          ].map(([l, v, w], i) =>
            React.createElement('div', { key: l, style: { flex: 1, padding: '8px 12px', borderRight: i < 7 ? `1px solid ${T.borderLight}` : 'none' } },
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textDim, fontWeight: 500, marginBottom: 2 } }, l),
              React.createElement('div', { style: { fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: w || T.text, letterSpacing: -0.3 } }, v),
            ),
          ),
        ),
      ),

      // Velocity
      tab === 'velocity' && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
        React.createElement(VelChart, { data: evt.bookings, label: 'Bookings' }),
        React.createElement(VelChart, { data: evt.payments, label: 'Payments' }),
      ),

      // Speakers
      tab === 'speakers' && React.createElement('div', { style: { display: 'flex', gap: 0, background: T.bgCard, borderRadius: 8, boxShadow: T.shadow1, overflow: 'hidden' } },
        [['Booked',evt.speakers.booked],['Paid',evt.speakers.paid],['Free',evt.speakers.free],['Confirmed',evt.speakers.confirmed],['Shortage',evt.speakers.shortage,evt.speakers.shortage>0?T.escalate:null],['Standby',evt.speakers.standby],['Grading',evt.speakers.grading],['Proposals',evt.speakers.proposals],['Interested',evt.speakers.interested]].map(([l,v,w],i)=>
          React.createElement('div', { key: l, style: { flex: 1, padding: '10px 10px', borderRight: i < 8 ? `1px solid ${T.borderLight}` : 'none' } },
            React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textDim, fontWeight: 500, marginBottom: 2 } }, l),
            React.createElement('div', { style: { fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: w || T.text, letterSpacing: -0.3 } }, v),
          ),
        ),
      ),

      // Marketing
      tab === 'marketing' && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        React.createElement('div', { style: { display: 'flex', gap: 0, background: T.bgCard, borderRadius: 8, boxShadow: T.shadow1, overflow: 'hidden' } },
          [['Total',evt.marketing.all],['SPF',evt.marketing.spf],['7d',evt.marketing.d7,evt.marketing.d7===0?T.watch:null],['14d',evt.marketing.d14],['21d',evt.marketing.d21]].map(([l,v,w],i)=>
            React.createElement('div', { key: l, style: { flex: 1, padding: '10px 12px', borderRight: i < 4 ? `1px solid ${T.borderLight}` : 'none' } },
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textDim, fontWeight: 500, marginBottom: 2 } }, l),
              React.createElement('div', { style: { fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: w || T.text } }, v),
            ),
          ),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 0, background: T.bgCard, borderRadius: 8, boxShadow: T.shadow1, overflow: 'hidden' } },
          [['TM Called',evt.tm.called],['LHF 0',evt.tm.lhf0],['Blue Ticket',evt.tm.blue],['Agenda View',evt.tm.agenda]].map(([l,v],i)=>
            React.createElement('div', { key: l, style: { flex: 1, padding: '10px 12px', borderRight: i < 3 ? `1px solid ${T.borderLight}` : 'none' } },
              React.createElement('div', { style: { fontFamily: T.sans, fontSize: 9, color: T.textDim, fontWeight: 500, marginBottom: 2 } }, l),
              React.createElement('div', { style: { fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.text } }, v),
            ),
          ),
        ),
      ),

      // Flags
      tab === 'flags' && (
        evt.flags.length === 0 ?
          React.createElement('div', { style: { padding: 16, textAlign: 'center', color: T.go, fontFamily: T.sans, fontSize: 12, fontWeight: 600 } }, '✓ No active red flags') :
          React.createElement('div', { style: { background: T.bgCard, borderRadius: 8, boxShadow: T.shadow1, overflow: 'hidden' } },
            evt.flags.map((f, i) =>
              React.createElement('div', { key: i, style: { display: 'grid', gridTemplateColumns: '3px 24px 1fr 90px 90px', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: i < evt.flags.length - 1 ? `1px solid ${T.borderLight}` : 'none' } },
                React.createElement('div', { style: { width: 3, height: 20, borderRadius: 2, background: SEV_MAP[f.sev] } }),
                React.createElement('span', { style: { fontFamily: T.mono, fontSize: 10, color: SEV_MAP[f.sev], fontWeight: 700 } }, f.id.replace('RF0','')),
                React.createElement('div', null,
                  React.createElement('span', { style: { fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.text } }, f.name),
                  React.createElement('span', { style: { fontFamily: T.sans, fontSize: 10, color: T.textDim, marginLeft: 6 } }, f.sev),
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: T.sans, fontSize: 8, color: T.textFaint, fontWeight: 600, letterSpacing: 0.5 } }, 'THRESHOLD'),
                  React.createElement('div', { style: { fontFamily: T.mono, fontSize: 11, color: T.textMid } }, f.thresh),
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: T.sans, fontSize: 8, color: T.textFaint, fontWeight: 600, letterSpacing: 0.5 } }, 'ACTUAL'),
                  React.createElement('div', { style: { fontFamily: T.mono, fontSize: 11, color: SEV_MAP[f.sev], fontWeight: 600 } }, f.cur),
                ),
              ),
            ),
          )
      ),
    ),
  );
};

Object.assign(window, { FleetView3, EventRow, InlinePanel });
