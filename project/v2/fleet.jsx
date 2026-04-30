// EPM v2 — Fleet View
const FleetView = ({ events, onSelect }) => {
  const [search, setSearch] = React.useState('');
  const [filterRec, setFilterRec] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [filterRep, setFilterRep] = React.useState('ALL');
  const [sortBy, setSortBy] = React.useState('severity');
  const [mode, setMode] = React.useState('grid');
  const [hoveredId, setHoveredId] = React.useState(null);

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
    events.forEach(e => {
      const k = e.rec.startsWith('GO') ? 'GO' : e.rec;
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [events]);

  const pill = (key, color) => {
    const active = filterRec === key;
    return React.createElement('button', {
      key, onClick: () => setFilterRec(filterRec === key ? 'ALL' : key),
      style: { padding: '7px 16px', borderRadius: 8, fontSize: 11, fontFamily: "'Space Grotesk'", fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', background: active ? color + '18' : 'transparent', color: active ? color : C.textDim, border: `1px solid ${active ? color + '50' : C.border}`, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }
    },
      key !== 'ALL' && (counts[key] || 0) > 0 && React.createElement(Pulse, { color, size: 6 }),
      `${key} ${counts[key] || 0}`
    );
  };

  const sel = (val, set, opts, label) => React.createElement('select', {
    value: val, onChange: e => set(e.target.value),
    style: { padding: '9px 14px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: "'Space Grotesk'", fontSize: 12, cursor: 'pointer', appearance: 'auto' }
  }, opts.map(o => {
    const [v, l] = Array.isArray(o) ? o : [o, o === 'ALL' ? `${label}: All` : o];
    return React.createElement('option', { key: v, value: v }, l);
  }));

  return React.createElement('div', { style: { padding: '0 32px 32px' } },
    // Stat pills
    React.createElement(FadeIn, { style: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' } },
      pill('ALL', C.textMid),
      pill('CRITICAL', C.critical), pill('ESCALATE', C.escalate), pill('WATCH', C.watch), pill('GO', C.go),
    ),

    // Controls
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('div', { style: { position: 'relative', flex: '1 1 260px', maxWidth: 340 } },
        React.createElement('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: C.textDim, strokeWidth: 2.5, strokeLinecap: 'round', style: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' } },
          React.createElement('circle', { cx: 10.5, cy: 10.5, r: 7.5 }), React.createElement('line', { x1: 21, y1: 21, x2: 15.8, y2: 15.8 }),
        ),
        React.createElement('input', { placeholder: 'Search events...', value: search, onChange: e => setSearch(e.target.value),
          style: { width: '100%', padding: '10px 14px 10px 40px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'Space Grotesk'", fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
          onFocus: e => e.target.style.borderColor = C.accent + '60', onBlur: e => e.target.style.borderColor = C.border,
        }),
      ),
      sel(filterStatus, setFilterStatus, ['ALL','Going Ahead','Standby','Postponed','Cancelled'], 'Status'),
      sel(filterRep, setFilterRep, ['ALL',...new Set(events.map(e=>e.rep))], 'Rep'),
      sel(sortBy, setSortBy, [['severity','Severity'],['flags','Red Flags ↓'],['weeks','Weeks Out ↑'],['delegates','Delegates ↑']], 'Sort'),
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 0 } },
        ['grid','list'].map(m => React.createElement('button', {
          key: m, onClick: () => setMode(m),
          style: { padding: '9px 16px', background: mode === m ? C.bg3 : 'transparent', border: `1px solid ${C.border}`, color: mode === m ? C.text : C.textDim, cursor: 'pointer', fontSize: 11, fontFamily: "'Space Grotesk'", fontWeight: 600, borderRadius: m === 'grid' ? '8px 0 0 8px' : '0 8px 8px 0', letterSpacing: 0.5, transition: 'all 0.15s' }
        }, m === 'grid' ? '⊞ Grid' : '☰ List')),
      ),
    ),

    React.createElement('div', { style: { fontSize: 11, color: C.textDim, fontFamily: "'Space Grotesk'", marginBottom: 14 } }, `${filtered.length} events`),

    // Grid
    mode === 'grid' ?
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 } },
        filtered.map((evt, i) => React.createElement(FadeIn, { key: evt.id, delay: Math.min(i * 20, 300) },
          React.createElement(FleetCard, { evt, hovered: hoveredId === evt.id, onHover: () => setHoveredId(evt.id), onLeave: () => setHoveredId(null), onClick: () => onSelect(evt) })
        ))
      ) :
      // List
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '180px 70px 70px 55px 70px 90px 110px 90px', gap: 10, padding: '0 16px 8px', borderBottom: `1px solid ${C.border}` } },
          ...['Event','Live','Paid','SpEx','Weeks','Flags','Decision','Status'].map(h => React.createElement('span', { key: h, style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5 } }, h)),
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 } },
          filtered.map((evt, i) => React.createElement(FleetRow, { key: evt.id, evt, delay: Math.min(i * 10, 200), onClick: () => onSelect(evt) })),
        ),
      ),
  );
};

const FleetCard = ({ evt, hovered, onHover, onLeave, onClick }) => {
  const rc = REC_COLORS[evt.rec] || C.textDim;
  const short = evt.rec.replace('GO — BENCHMARK CROSSED','GO ✓').replace('POSTPONED','POST');
  const isCrit = evt.rec === 'CRITICAL';
  return React.createElement('div', {
    onClick, onMouseEnter: onHover, onMouseLeave: onLeave,
    style: { background: hovered ? C.bg3 : C.bg2, border: `1px solid ${hovered ? C.borderLight : C.border}`, borderRadius: 10, padding: 18, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${rc}` }
  },
    isCrit && React.createElement(Glow, { color: C.critical, size: 100, style: { top: -30, right: -30, opacity: hovered ? 0.6 : 0.3 } }),
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: 0.3 } }, evt.code),
        React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' } },
          React.createElement('span', { style: { background: C.bg1, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, color: C.textMid } }, evt.rep),
          evt.weeksOut > 0 ? `${evt.weeksOut}w out` : evt.weeksOut === 0 ? 'This week' : 'Past',
        ),
      ),
      React.createElement(Badge, { label: short, color: rc }),
    ),
    // KPIs
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 } },
      [['Live', evt.live25], ['Paid', evt.paid, evt.paid < 20 ? C.critical : null], ['SpEx', evt.spex, evt.spex < 2 ? C.escalate : null]].map(([l, v, w]) =>
        React.createElement('div', { key: l },
          React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.2 } }, l),
          React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: w || C.text, marginTop: 2 } }, v),
        )
      )
    ),
    // Footer
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` } },
      evt.flagCount > 0 ?
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          React.createElement('div', { style: { width: 22, height: 22, borderRadius: 6, background: (evt.flagCount >= 5 ? C.critical : evt.flagCount >= 3 ? C.escalate : C.watch) + '18', color: evt.flagCount >= 5 ? C.critical : evt.flagCount >= 3 ? C.escalate : C.watch, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono'" } }, evt.flagCount),
          React.createElement('span', { style: { fontSize: 11, color: C.textDim, fontFamily: "'Space Grotesk'" } }, 'flags'),
        ) :
        React.createElement('span', { style: { fontSize: 11, color: C.go + '80', fontFamily: "'Space Grotesk'", fontWeight: 600 } }, '✓ Clean'),
      React.createElement('span', { style: { fontSize: 10, color: STATUS_COLORS[evt.status] || C.textDim, fontFamily: "'Space Grotesk'", fontWeight: 500 } }, evt.status),
    ),
  );
};

const FleetRow = ({ evt, delay, onClick }) => {
  const [h, setH] = React.useState(false);
  const rc = REC_COLORS[evt.rec] || C.textDim;
  const short = evt.rec.replace('GO — BENCHMARK CROSSED','GO ✓');
  return React.createElement(FadeIn, { delay },
    React.createElement('div', {
      onClick, onMouseEnter: () => setH(true), onMouseLeave: () => setH(false),
      style: { display: 'grid', gridTemplateColumns: '180px 70px 70px 55px 70px 90px 110px 90px', gap: 10, padding: '11px 16px', background: h ? C.bg3 : C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', transition: 'background 0.15s', borderLeft: `3px solid ${rc}`, alignItems: 'center' }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 600, color: C.text } }, evt.code),
        React.createElement('span', { style: { fontSize: 10, color: C.textDim, fontFamily: "'Space Grotesk'", background: C.bg1, padding: '1px 5px', borderRadius: 3 } }, evt.rep),
      ),
      React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 13, color: C.text } }, evt.live25),
      React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 13, color: evt.paid < 20 ? C.critical : C.text } }, evt.paid),
      React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 13, color: evt.spex < 2 ? C.escalate : C.text } }, evt.spex),
      React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 12, color: C.textMid } }, evt.weeksOut > 0 ? `${evt.weeksOut}w` : evt.weeksOut === 0 ? 'Now' : 'Past'),
      evt.flagCount > 0 ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5 } },
        React.createElement('div', { style: { minWidth: 20, height: 20, borderRadius: 5, background: (evt.flagCount >= 5 ? C.critical : evt.flagCount >= 3 ? C.escalate : C.watch) + '18', color: evt.flagCount >= 5 ? C.critical : evt.flagCount >= 3 ? C.escalate : C.watch, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono'" } }, evt.flagCount),
        React.createElement('span', { style: { fontSize: 10, color: C.textDim } }, 'flags'),
      ) : React.createElement('span', { style: { fontSize: 10, color: C.go + '80' } }, '✓'),
      React.createElement(Badge, { label: short, color: rc, size: 'sm' }),
      React.createElement('span', { style: { fontSize: 10, color: STATUS_COLORS[evt.status] || C.textDim, fontFamily: "'Space Grotesk'" } }, evt.status),
    ),
  );
};

Object.assign(window, { FleetView, FleetCard, FleetRow });
