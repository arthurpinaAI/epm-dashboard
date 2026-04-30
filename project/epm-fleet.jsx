// Fleet View Component
const FleetView = ({ events, onSelectEvent }) => {
  const [search, setSearch] = React.useState('');
  const [filterRec, setFilterRec] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [filterRep, setFilterRep] = React.useState('ALL');
  const [sortBy, setSortBy] = React.useState('redFlags');
  const [viewMode, setViewMode] = React.useState('grid');

  const filtered = React.useMemo(() => {
    let list = [...events];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e => e.eventCode.toLowerCase().includes(s) || e.marketRep.toLowerCase().includes(s));
    }
    if (filterRec !== 'ALL') list = list.filter(e => e.recommendation === filterRec);
    if (filterStatus !== 'ALL') list = list.filter(e => e.eventStatus === filterStatus);
    if (filterRep !== 'ALL') list = list.filter(e => e.marketRep === filterRep);

    list.sort((a, b) => {
      if (sortBy === 'redFlags') return b.redFlagCount - a.redFlagCount;
      if (sortBy === 'weeksOut') return a.weeksOut - b.weeksOut;
      if (sortBy === 'delegates') return a.paidHeadCount - b.paidHeadCount;
      if (sortBy === 'severity') return RECOMMENDATION_ORDER.indexOf(a.recommendation) - RECOMMENDATION_ORDER.indexOf(b.recommendation);
      return 0;
    });
    return list;
  }, [events, search, filterRec, filterStatus, filterRep, sortBy]);

  const recCounts = React.useMemo(() => {
    const c = {};
    events.forEach(e => { c[e.recommendation] = (c[e.recommendation] || 0) + 1; });
    return c;
  }, [events]);

  const pillStyle = (active, color) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'Outfit, sans-serif',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    background: active ? color + '18' : 'transparent',
    color: active ? color : '#8892a4',
    border: `1px solid ${active ? color + '60' : '#1e2a3a'}`,
  });

  return React.createElement('div', { style: { padding: '0 32px 32px' } },
    // Summary pills
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' } },
      React.createElement('button', { onClick: () => setFilterRec('ALL'), style: pillStyle(filterRec === 'ALL', '#8892a4') }, `All ${events.length}`),
      ...['CRITICAL', 'ESCALATE', 'WATCH', 'GO'].map(r =>
        React.createElement('button', { key: r, onClick: () => setFilterRec(filterRec === r ? 'ALL' : r),
          style: pillStyle(filterRec === r, RECOMMENDATION_COLORS[r]) },
          `${r} ${recCounts[r] || 0}`)
      )
    ),

    // Controls bar
    React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' } },
      // Search
      React.createElement('div', { style: { position: 'relative', flex: '1 1 240px', maxWidth: 320 } },
        React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#586374', strokeWidth: 2, style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' } },
          React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
          React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
        ),
        React.createElement('input', {
          placeholder: 'Search events...', value: search, onChange: e => setSearch(e.target.value),
          style: { width: '100%', padding: '10px 12px 10px 36px', background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 8, color: '#e1e4e8', fontFamily: 'Outfit', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
        })
      ),
      // Dropdowns
      ...[ 
        { val: filterStatus, set: setFilterStatus, opts: ['ALL','Going Ahead','Standby','Postponed','Cancelled'], label: 'Status' },
        { val: filterRep, set: setFilterRep, opts: ['ALL','VV','PM','PT','JS'], label: 'Rep' },
        { val: sortBy, set: setSortBy, opts: [['redFlags','Red Flags ↓'],['severity','Severity'],['weeksOut','Weeks Out ↑'],['delegates','Delegates ↑']], label: 'Sort' },
      ].map(({ val, set, opts, label }) =>
        React.createElement('select', {
          key: label, value: val, onChange: e => set(e.target.value),
          style: { padding: '10px 12px', background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: 8, color: '#e1e4e8', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }
        },
          opts.map(o => {
            const [v, l] = Array.isArray(o) ? o : [o, o === 'ALL' ? `${label}: All` : o];
            return React.createElement('option', { key: v, value: v }, l);
          })
        )
      ),
      // View toggle
      React.createElement('div', { style: { display: 'flex', gap: 0, marginLeft: 'auto' } },
        ['grid', 'list'].map(m =>
          React.createElement('button', {
            key: m, onClick: () => setViewMode(m),
            style: { padding: '9px 14px', background: viewMode === m ? '#1e2a3a' : 'transparent', border: '1px solid #1e2a3a', color: viewMode === m ? '#e1e4e8' : '#586374', cursor: 'pointer', fontSize: 12, fontFamily: 'Outfit', borderRadius: m === 'grid' ? '8px 0 0 8px' : '0 8px 8px 0' }
          }, m === 'grid' ? '▦ Grid' : '☰ List')
        )
      )
    ),

    // Results count
    React.createElement('div', { style: { fontSize: 12, color: '#586374', marginBottom: 16, fontFamily: 'Outfit' } }, `${filtered.length} events`),

    // Event cards
    viewMode === 'grid' ?
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 } },
        filtered.map(evt => React.createElement(EventCard, { key: evt.id, evt, onClick: () => onSelectEvent(evt) }))
      ) :
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        filtered.map(evt => React.createElement(EventRow, { key: evt.id, evt, onClick: () => onSelectEvent(evt) }))
      )
  );
};

const EventCard = ({ evt, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const recColor = RECOMMENDATION_COLORS[evt.recommendation] || '#8892a4';
  const shortRec = evt.recommendation.replace('GO — BENCHMARK CROSSED', 'GO ✓').replace('POSTPONED', 'POST');

  return React.createElement('div', {
    onClick, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false),
    style: {
      background: hovered ? '#111b2e' : '#0d1320', border: '1px solid #1e2a3a', borderRadius: 10,
      padding: 18, cursor: 'pointer', transition: 'all 0.15s',
      borderLeft: `3px solid ${recColor}`, position: 'relative',
    }
  },
    // Top row: code + badge
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 700, color: '#e1e4e8', letterSpacing: 0.5 } }, evt.eventCode),
        React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374', marginTop: 3 } },
          evt.marketRep + ' · ' + (evt.weeksOut > 0 ? `${evt.weeksOut}w out` : evt.weeksOut === 0 ? 'This week' : 'Past'))
      ),
      React.createElement('span', {
        style: { fontSize: 10, fontFamily: 'Outfit', fontWeight: 700, padding: '4px 10px', borderRadius: 5,
          background: recColor + '18', color: recColor, letterSpacing: 0.8, whiteSpace: 'nowrap' }
      }, shortRec)
    ),

    // KPI grid
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 } },
      ...[
        ['Live', evt.liveCount2025, null],
        ['Paid', evt.paidHeadCount, evt.paidHeadCount < 20 ? '#FF1744' : null],
        ['SpEx', evt.spexTotal, evt.spexTotal < 2 ? '#FF6E40' : null],
      ].map(([label, val, warn]) =>
        React.createElement('div', { key: label },
          React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 10, color: '#586374', textTransform: 'uppercase', letterSpacing: 1 } }, label),
          React.createElement('div', { style: { fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: warn || '#e1e4e8', marginTop: 2 } }, val)
        )
      )
    ),

    // Bottom: red flags + status
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid #1e2a3a' } },
      evt.redFlagCount > 0 ?
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          React.createElement('span', { style: { width: 20, height: 20, borderRadius: '50%', background: evt.redFlagCount >= 5 ? '#FF174422' : evt.redFlagCount >= 3 ? '#FF6E4022' : '#FFD74022', color: evt.redFlagCount >= 5 ? '#FF1744' : evt.redFlagCount >= 3 ? '#FF6E40' : '#FFD740', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono' } }, evt.redFlagCount),
          React.createElement('span', { style: { fontSize: 11, color: '#586374', fontFamily: 'Outfit' } }, evt.redFlagCount === 1 ? 'flag' : 'flags')
        ) :
        React.createElement('span', { style: { fontSize: 11, color: '#2d6b3f', fontFamily: 'Outfit' } }, '✓ Clean'),
      React.createElement('span', { style: { fontSize: 10, color: STATUS_COLORS[evt.eventStatus] || '#586374', fontFamily: 'Outfit', fontWeight: 500, opacity: 0.8 } }, evt.eventStatus)
    )
  );
};

const EventRow = ({ evt, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const recColor = RECOMMENDATION_COLORS[evt.recommendation] || '#8892a4';
  const shortRec = evt.recommendation.replace('GO — BENCHMARK CROSSED', 'GO ✓');

  return React.createElement('div', {
    onClick, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false),
    style: {
      display: 'grid', gridTemplateColumns: '200px 80px 80px 60px 80px 70px 120px 100px',
      alignItems: 'center', gap: 12, padding: '12px 16px',
      background: hovered ? '#111b2e' : '#0d1320', border: '1px solid #1e2a3a', borderRadius: 6,
      cursor: 'pointer', transition: 'background 0.12s', borderLeft: `3px solid ${recColor}`,
    }
  },
    React.createElement('div', null,
      React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, color: '#e1e4e8' } }, evt.eventCode),
      React.createElement('span', { style: { fontSize: 11, color: '#586374', fontFamily: 'Outfit', marginLeft: 8 } }, evt.marketRep)
    ),
    React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 13, color: '#e1e4e8' } }, evt.liveCount2025),
    React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 13, color: evt.paidHeadCount < 20 ? '#FF1744' : '#e1e4e8' } }, evt.paidHeadCount),
    React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 13, color: evt.spexTotal < 2 ? '#FF6E40' : '#e1e4e8' } }, evt.spexTotal),
    React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 13, color: '#8892a4' } }, evt.weeksOut > 0 ? `${evt.weeksOut}w` : evt.weeksOut === 0 ? 'Now' : 'Past'),
    evt.redFlagCount > 0 ?
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5 } },
        React.createElement('span', { style: { minWidth: 20, height: 20, borderRadius: '50%', background: evt.redFlagCount >= 5 ? '#FF174422' : evt.redFlagCount >= 3 ? '#FF6E4022' : '#FFD74022', color: evt.redFlagCount >= 5 ? '#FF1744' : evt.redFlagCount >= 3 ? '#FF6E40' : '#FFD740', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono' } }, evt.redFlagCount),
        React.createElement('span', { style: { fontSize: 11, color: '#586374', fontFamily: 'Outfit' } }, 'flags')
      ) :
      React.createElement('span', { style: { fontSize: 11, color: '#2d6b3f', fontFamily: 'Outfit' } }, '✓ Clean'),
    React.createElement('span', { style: { fontSize: 10, fontFamily: 'Outfit', fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: recColor + '18', color: recColor, textAlign: 'center' } }, shortRec),
  );
};

Object.assign(window, { FleetView, EventCard, EventRow });
