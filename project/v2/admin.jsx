// EPM v2 — Admin Panel: Formula Builder + Rules Config
const AdminPanel = () => {
  const [tab, setTab] = React.useState('formulas');
  const [rules, setRules] = React.useState(RULES.map(r => ({...r})));
  const [tiers, setTiers] = React.useState({ watch: 1, escalate: 3, critical: 5 });
  const [formulas, setFormulas] = React.useState(FORMULAS.map(f => ({...f})));
  const [statuses, setStatuses] = React.useState(['Going Ahead','Standby','Postponed','Postpone','Cancelled']);
  const [reps, setReps] = React.useState(['VV','PM','PT','JS','AK','RD','ML','SG']);
  const [newStatus, setNewStatus] = React.useState('');
  const [newRep, setNewRep] = React.useState('');
  const [editingFormula, setEditingFormula] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1800); };
  const upRule = (id, k, v) => setRules(p => p.map(r => r.id === id ? {...r, [k]: v} : r));

  const tabBtn = (id, label, icon) => React.createElement('button', {
    onClick: () => setTab(id),
    style: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: '10px 10px 0 0', fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, background: tab === id ? C.bg2 : 'transparent', color: tab === id ? C.text : C.textDim, border: `1px solid ${tab === id ? C.border : 'transparent'}`, borderBottom: tab === id ? `1px solid ${C.bg2}` : `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1, position: 'relative', zIndex: tab === id ? 2 : 1, letterSpacing: 0.3 }
  }, React.createElement('span', { style: { fontSize: 14 } }, icon), label);

  const inp = (extra = {}) => ({
    padding: '8px 12px', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontFamily: "'JetBrains Mono'", fontSize: 13, width: 72, textAlign: 'center', outline: 'none', ...extra,
  });

  // Formula block renderer
  const FormulaBlock = ({ block }) => {
    const bt = BLOCK_TYPES[block.type] || BLOCK_TYPES.field;
    return React.createElement('span', {
      style: { display: 'inline-flex', alignItems: 'center', padding: block.type === 'paren' ? '2px 6px' : '4px 10px', borderRadius: 6, background: bt.bg, color: bt.color, fontFamily: block.type === 'num' ? "'JetBrains Mono'" : "'Space Grotesk'", fontSize: block.type === 'paren' ? 16 : 12, fontWeight: 600, border: `1px solid ${bt.color}20`, cursor: 'grab', userSelect: 'none', transition: 'transform 0.1s', whiteSpace: 'nowrap' },
      onMouseEnter: e => e.target.style.transform = 'scale(1.05)',
      onMouseLeave: e => e.target.style.transform = 'scale(1)',
    }, block.val);
  };

  const FormulaRow = ({ formula }) => {
    const isEditing = editingFormula === formula.id;
    return React.createElement('div', {
      style: { background: isEditing ? C.bg3 : C.bg2, border: `1px solid ${isEditing ? C.accent + '40' : C.border}`, borderRadius: 10, padding: '16px 20px', transition: 'all 0.2s' }
    },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 } },
        React.createElement('div', null,
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.accent, fontWeight: 600, background: C.accent + '15', padding: '2px 8px', borderRadius: 4 } }, formula.id),
            React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, color: C.text } }, formula.name),
          ),
          React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 4 } }, formula.desc),
        ),
        React.createElement('button', {
          onClick: () => setEditingFormula(isEditing ? null : formula.id),
          style: { padding: '6px 14px', borderRadius: 6, background: isEditing ? C.accent + '20' : C.bg1, border: `1px solid ${isEditing ? C.accent + '40' : C.border}`, color: isEditing ? C.accent : C.textDim, fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }
        }, isEditing ? '✓ Done' : 'Edit'),
      ),
      // Formula expression
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '12px 16px', background: C.bg0, borderRadius: 8, border: `1px dashed ${isEditing ? C.accent + '30' : C.border}`, minHeight: 44 } },
        React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.textDim, marginRight: 4 } }, `${formula.output} =`),
        formula.expr.map((block, i) => React.createElement(FormulaBlock, { key: i, block })),
      ),
      // Editing palette
      isEditing && React.createElement(FadeIn, { style: { marginTop: 12 } },
        React.createElement('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap' } },
          [
            { label: 'Fields', type: 'field', items: ['Live Count','Paid','Free','Cancelled','SpEx Total','Bookings 7d','Payments 7d','Expected','Weeks Out','Registrations','Payments'] },
            { label: 'Operations', type: 'op', items: ['COUNT WHERE','SUM WHERE','LOOKUP','IF/THEN','+','−','×','÷','AND','OR','> (greater)','< (less)','= (equals)'] },
            { label: 'Conditions', type: 'cond', items: ['Status = Active','Year = 2025','Amount > 0','Status ≠ Cancelled','TicketType = Free','Date ≥ TODAY() - 7','Date ≥ TODAY() - 14'] },
          ].map(group => React.createElement('div', { key: group.label, style: { flex: '1 1 200px' } },
            React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 } }, group.label),
            React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
              group.items.map(item => {
                const bt = BLOCK_TYPES[group.type];
                return React.createElement('button', {
                  key: item,
                  onClick: () => { setFormulas(prev => prev.map(f => f.id === formula.id ? {...f, expr: [...f.expr, {type: group.type, val: item}]} : f)); flash('Block added'); },
                  style: { padding: '4px 10px', borderRadius: 5, background: bt.bg, color: bt.color, border: `1px solid ${bt.color}18`, fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s' },
                  onMouseEnter: e => { e.target.style.background = bt.color + '25'; },
                  onMouseLeave: e => { e.target.style.background = bt.bg; },
                }, item);
              }),
            ),
          )),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 12 } },
          React.createElement('button', {
            onClick: () => { setFormulas(prev => prev.map(f => f.id === formula.id ? {...f, expr: f.expr.slice(0, -1)} : f)); flash('Block removed'); },
            style: { padding: '6px 14px', borderRadius: 6, background: C.critical + '15', border: `1px solid ${C.critical}25`, color: C.critical, fontFamily: "'Space Grotesk'", fontSize: 11, cursor: 'pointer' }
          }, '← Remove Last'),
          React.createElement('button', {
            onClick: () => { setFormulas(prev => prev.map(f => f.id === formula.id ? {...f, expr: []} : f)); flash('Formula cleared'); },
            style: { padding: '6px 14px', borderRadius: 6, background: C.bg1, border: `1px solid ${C.border}`, color: C.textDim, fontFamily: "'Space Grotesk'", fontSize: 11, cursor: 'pointer' }
          }, 'Clear All'),
        ),
      ),
    );
  };

  return React.createElement('div', { style: { padding: '0 32px 40px' } },
    toast && React.createElement('div', { style: { position: 'fixed', top: 72, right: 32, background: C.go, color: C.bg0, padding: '10px 20px', borderRadius: 8, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 12, zIndex: 200, animation: 'fadeIn 0.2s', boxShadow: `0 4px 20px ${C.go}30` } }, toast),

    React.createElement(FadeIn, null,
      React.createElement('div', { style: { marginBottom: 8 } },
        React.createElement('h2', { style: { fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.3 } }, 'Rules Engine'),
        React.createElement('p', { style: { fontFamily: "'Space Grotesk'", fontSize: 12, color: C.textDim, margin: '4px 0 0' } }, 'Edit formulas, thresholds, and configuration — changes recalculate instantly.'),
      ),
    ),

    // Tabs
    React.createElement('div', { style: { display: 'flex', gap: 2, marginBottom: 0 } },
      tabBtn('formulas', 'Formula Builder', '∑'),
      tabBtn('rules', 'Red Flag Rules', '⚑'),
      tabBtn('tiers', 'Decision Tiers', '◆'),
      tabBtn('dropdowns', 'Dropdowns', '▤'),
    ),

    React.createElement('div', { style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '0 10px 10px 10px', padding: 28 } },

      // === FORMULAS ===
      tab === 'formulas' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, color: C.text } }, 'Calculated Metrics'),
            React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 2 } }, 'Visual formula builder — drag blocks to compose calculations'),
          ),
          React.createElement('button', {
            onClick: () => { const id = `F${String(formulas.length+1).padStart(3,'0')}`; setFormulas(p => [...p, {id, name:'New Formula', output:'custom', expr:[], desc:'Custom calculated metric'}]); flash('Formula added'); },
            style: { padding: '8px 16px', borderRadius: 8, background: C.accent + '15', border: `1px solid ${C.accent}30`, color: C.accent, fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, cursor: 'pointer' }
          }, '+ New Formula'),
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          formulas.map(f => React.createElement(FormulaRow, { key: f.id, formula: f })),
        ),
      ),

      // === RULES ===
      tab === 'rules' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '36px 1fr 180px 85px 85px 95px 50px', gap: 10, padding: '0 0 10px', borderBottom: `1px solid ${C.border}`, marginBottom: 6 } },
          ...['','Rule','Description','Threshold','Gate','Severity',''].map((h,i) =>
            React.createElement('span', { key: i, style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5 } }, h)),
        ),
        rules.map(r => React.createElement(FadeIn, { key: r.id, delay: 0 },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '36px 1fr 180px 85px 85px 95px 50px', gap: 10, padding: '13px 0', borderBottom: `1px solid ${C.border}08`, alignItems: 'center', opacity: r.on ? 1 : 0.35, transition: 'opacity 0.25s' } },
            React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 10, color: SEV_COLORS[r.sev], fontWeight: 700 } }, r.id.replace('RF0','')),
            React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: C.text } }, r.name),
            React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, lineHeight: 1.4 } }, r.desc),
            r.val !== null ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 3 } },
              React.createElement('input', { type: 'number', value: r.val, onChange: e => { upRule(r.id, 'val', +e.target.value); flash('Updated'); }, style: inp() }),
              r.pct && React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.textDim } }, '%'),
            ) : React.createElement('span', { style: { color: C.textDim + '40', fontSize: 11 } }, '—'),
            r.gate !== null ? React.createElement('input', { type: 'number', value: r.gate, onChange: e => { upRule(r.id, 'gate', +e.target.value); flash('Updated'); }, style: inp() }) : React.createElement('span', { style: { color: C.textDim + '40', fontSize: 11 } }, '—'),
            React.createElement('select', { value: r.sev, onChange: e => { upRule(r.id, 'sev', e.target.value); flash('Updated'); }, style: { ...inp({ width: 90, fontFamily: "'Space Grotesk'", textAlign: 'left', cursor: 'pointer' }), color: SEV_COLORS[r.sev] } },
              ['critical','high','medium','low'].map(s => React.createElement('option', { key: s, value: s }, s)),
            ),
            React.createElement(Toggle, { on: r.on, onChange: () => { upRule(r.id, 'on', !r.on); flash(r.on ? 'Disabled' : 'Enabled'); } }),
          ),
        )),
      ),

      // === TIERS ===
      tab === 'tiers' && React.createElement('div', null,
        React.createElement('p', { style: { fontFamily: "'Space Grotesk'", fontSize: 13, color: C.textDim, marginBottom: 24 } }, 'How many red flags trigger each recommendation tier:'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 } },
          [{ k:'watch', l:'WATCH', c:C.watch, d:'Monitor weekly' },{ k:'escalate', l:'ESCALATE', c:C.escalate, d:'Management call 48hrs' },{ k:'critical', l:'CRITICAL', c:C.critical, d:'Recommend postpone/kill' }].map(t =>
            React.createElement('div', { key: t.k, style: { display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', background: C.bg0, borderRadius: 10, border: `1px solid ${C.border}` } },
              React.createElement(Pulse, { color: t.c, size: 8 }),
              React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, color: t.c, minWidth: 85 } }, t.l),
              React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 12, color: C.textDim, flex: 1 } }, t.d),
              React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim } }, '≥'),
              React.createElement('input', { type: 'number', value: tiers[t.k], min: 1, onChange: e => { setTiers(p => ({...p, [t.k]: +e.target.value})); flash('Updated'); }, style: inp({ width: 52 }) }),
              React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim } }, 'flags'),
            ),
          ),
        ),
        // Benchmarks
        React.createElement('div', { style: { marginTop: 28 } },
          React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 } }, 'Benchmarks'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 } },
            [['Payment Benchmark', 'Minimum paid delegates for "safe"', 30], ['Break-Even Delegates', 'Minimum for event viability', 40]].map(([l, d, v]) =>
              React.createElement('div', { key: l, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: C.bg0, borderRadius: 10, border: `1px solid ${C.border}` } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 13, color: C.text } }, l),
                  React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 2 } }, d),
                ),
                React.createElement('input', { type: 'number', defaultValue: v, onChange: () => flash('Updated'), style: inp({ width: 56 }) }),
              ),
            ),
          ),
        ),
      ),

      // === DROPDOWNS ===
      tab === 'dropdowns' && React.createElement('div', null,
        ...[
          { title: 'Event Statuses', items: statuses, setItems: setStatuses, newVal: newStatus, setNew: setNewStatus, colorMap: STATUS_COLORS, mono: false },
          { title: 'Market Rep Codes', items: reps, setItems: setReps, newVal: newRep, setNew: setNewRep, colorMap: {}, mono: true },
        ].map(g => React.createElement('div', { key: g.title, style: { marginBottom: 28 } },
          React.createElement('h4', { style: { fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 } }, g.title),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 } },
            g.items.map(s => React.createElement('div', { key: s, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 7, transition: 'border-color 0.15s' }, onMouseEnter: e => e.currentTarget.style.borderColor = C.borderLight, onMouseLeave: e => e.currentTarget.style.borderColor = C.border },
              g.colorMap[s] && React.createElement(Pulse, { color: g.colorMap[s], size: 7 }),
              React.createElement('span', { style: { fontFamily: g.mono ? "'JetBrains Mono'" : "'Space Grotesk'", fontSize: 13, color: C.text, fontWeight: g.mono ? 600 : 400 } }, s),
              React.createElement('button', { onClick: () => { g.setItems(p => p.filter(x => x !== s)); flash('Removed'); }, style: { background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 15, padding: '0 2px', lineHeight: 1, transition: 'color 0.15s' }, onMouseEnter: e => e.target.style.color = C.critical, onMouseLeave: e => e.target.style.color = C.textDim }, '×'),
            )),
          ),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('input', { placeholder: `Add ${g.title.toLowerCase()}...`, value: g.newVal, onChange: e => g.setNew(e.target.value), style: inp({ width: 200, textAlign: 'left', fontFamily: g.mono ? "'JetBrains Mono'" : "'Space Grotesk'" }), onKeyDown: e => { if (e.key === 'Enter' && g.newVal.trim()) { g.setItems(p => [...p, g.mono ? g.newVal.trim().toUpperCase() : g.newVal.trim()]); g.setNew(''); flash('Added'); } } }),
            React.createElement('button', { onClick: () => { if (g.newVal.trim()) { g.setItems(p => [...p, g.mono ? g.newVal.trim().toUpperCase() : g.newVal.trim()]); g.setNew(''); flash('Added'); } }, style: { padding: '8px 18px', background: C.accent + '15', border: `1px solid ${C.accent}30`, borderRadius: 7, color: C.accent, fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, cursor: 'pointer' } }, '+ Add'),
          ),
        )),
      ),
    ),
  );
};

Object.assign(window, { AdminPanel });
