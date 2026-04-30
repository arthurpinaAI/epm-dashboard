// EPM v3 — Admin Panel: Formula Builder + Rules Config (Light Premium)
const AdminPanel3 = () => {
  const [tab, setTab] = React.useState('formulas');
  const [rules, setRules] = React.useState(RULES3.map(r => ({...r})));
  const [tiers, setTiers] = React.useState({ watch: 1, escalate: 3, critical: 5 });
  const [formulas, setFormulas] = React.useState(CALC_FORMULAS.map(f => ({...f, blocks: [...f.blocks]})));
  const [statuses, setStatuses] = React.useState(['Going Ahead','Standby','Postponed','Postpone','Cancelled']);
  const [reps, setReps] = React.useState(['VV','PM','PT','JS','AK','RD','ML','SG']);
  const [newStatus, setNewStatus] = React.useState('');
  const [newRep, setNewRep] = React.useState('');
  const [editId, setEditId] = React.useState(null);
  const [fieldFilter, setFieldFilter] = React.useState('');
  const [fieldTable, setFieldTable] = React.useState('All');
  const [toast, setToast] = React.useState(null);

  const flash = m => { setToast(m); setTimeout(() => setToast(null), 1600); };
  const upRule = (id, k, v) => setRules(p => p.map(r => r.id === id ? {...r, [k]: v} : r));
  const addBlock = (fid, block) => setFormulas(p => p.map(f => f.id === fid ? {...f, blocks: [...f.blocks, block]} : f));
  const popBlock = (fid) => setFormulas(p => p.map(f => f.id === fid ? {...f, blocks: f.blocks.slice(0,-1)} : f));
  const clearBlocks = (fid) => setFormulas(p => p.map(f => f.id === fid ? {...f, blocks: []} : f));

  const inp = (extra={}) => ({ padding:'8px 12px', background: T.bgInset, border:`1px solid ${T.border}`, borderRadius:8, color: T.text, fontFamily: T.mono, fontSize:13, width:68, textAlign:'center', outline:'none', ...extra });

  const tabBtn = (id, label, icon) => React.createElement('button', {
    onClick: () => setTab(id),
    style: { display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:'12px 12px 0 0', fontFamily: T.sans, fontSize:12, fontWeight:600, background: tab===id ? T.bgCard : 'transparent', color: tab===id ? T.text : T.textDim, border:`1px solid ${tab===id ? T.border : 'transparent'}`, borderBottom: tab===id ? `1px solid ${T.bgCard}` : `1px solid ${T.border}`, cursor:'pointer', transition:'all 0.15s', marginBottom:-1, position:'relative', zIndex: tab===id ? 2 : 1 }
  }, React.createElement('span',{style:{fontSize:13, opacity:0.7}},icon), label);

  // Block renderer
  const Block = ({ block }) => {
    const s = BLOCK_STYLE[block.t] || BLOCK_STYLE.field;
    const isParen = block.t === 'paren';
    return React.createElement('span', {
      style: { display:'inline-flex', alignItems:'center', padding: isParen ? '2px 5px' : '4px 11px', borderRadius: isParen ? 4 : 7, background: s.bg, color: s.color, fontFamily: block.t==='val' || block.t==='math' || block.t==='cmp' ? T.mono : T.sans, fontSize: isParen ? 15 : 12, fontWeight: 600, border:`1px solid ${s.border}`, whiteSpace:'nowrap', transition:'transform 0.1s, box-shadow 0.1s', cursor:'default' },
      onMouseEnter: e => { e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow=T.shadow1; },
      onMouseLeave: e => { e.target.style.transform='none'; e.target.style.boxShadow='none'; },
    }, block.t === 'ref' ? `⟨${block.v}⟩` : block.v);
  };

  // Filtered Zoho fields
  const filteredFields = React.useMemo(() => {
    let f = ZOHO_FIELDS;
    if (fieldTable !== 'All') f = f.filter(x => x.table === fieldTable);
    if (fieldFilter) { const s = fieldFilter.toLowerCase(); f = f.filter(x => x.label.toLowerCase().includes(s) || x.key.toLowerCase().includes(s)); }
    return f;
  }, [fieldTable, fieldFilter]);

  return React.createElement('div', { style: { padding: '0 36px 40px' } },
    toast && React.createElement('div', { style: { position:'fixed', top:68, right:36, background: T.go, color:'#fff', padding:'9px 20px', borderRadius:10, fontFamily: T.sans, fontWeight:700, fontSize:12, zIndex:200, boxShadow: T.shadow2, animation:'fadeIn 0.2s' } }, toast),

    React.createElement(Fade, null,
      React.createElement('div', { style: { marginBottom: 10 } },
        React.createElement('h2', { style: { fontFamily: T.sans, fontSize: 20, fontWeight: 800, color: T.text, margin: 0, letterSpacing: -0.5 } }, 'Rules Engine'),
        React.createElement('p', { style: { fontFamily: T.sans, fontSize: 13, color: T.textDim, margin: '4px 0 0', fontWeight: 500 } }, 'Build formulas from raw database fields, configure thresholds, manage dropdowns.'),
      ),
    ),

    React.createElement('div', { style: { display:'flex', gap:2, marginBottom:0 } },
      tabBtn('formulas','Formula Builder','∑'),
      tabBtn('rules','Red Flag Rules','⚑'),
      tabBtn('tiers','Decision Tiers','◆'),
      tabBtn('dropdowns','Dropdowns','▤'),
    ),

    React.createElement('div', { style: { background: T.bgCard, border:`1px solid ${T.border}`, borderRadius:'0 12px 12px 12px', padding:28, boxShadow: T.shadow1 } },

      // ═══ FORMULA BUILDER ═══
      tab === 'formulas' && React.createElement('div', null,
        React.createElement('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontFamily: T.sans, fontSize:15, fontWeight:700, color: T.text } }, 'Calculated Metrics'),
            React.createElement('div', { style: { fontFamily: T.sans, fontSize:12, color: T.textDim, marginTop:3, fontWeight:500 } }, 'Build outputs from raw Zoho database fields + operations + conditions'),
          ),
          React.createElement('button', {
            onClick: () => { const id=`F${String(formulas.length+1).padStart(3,'0')}`; setFormulas(p=>[...p,{id,name:'New Metric',output:'custom_field',desc:'Custom calculated metric',blocks:[]}]); flash('Formula added'); },
            style: { padding:'8px 18px', borderRadius:10, background: T.accentBg, border:`1px solid ${T.accentBorder}`, color: T.accent, fontFamily: T.sans, fontSize:12, fontWeight:650, cursor:'pointer', transition:'all 0.15s' },
            onMouseEnter: e => e.target.style.background = T.accent+'15',
            onMouseLeave: e => e.target.style.background = T.accentBg,
          }, '+ New Metric'),
        ),

        // Formula cards
        React.createElement('div', { style: { display:'flex', flexDirection:'column', gap:12 } },
          formulas.map(f => {
            const isEdit = editId === f.id;
            return React.createElement(Fade, { key: f.id },
              React.createElement('div', { style: { background: isEdit ? T.bg : T.bgCard, border:`1px solid ${isEdit ? T.accent+'30' : T.border}`, borderRadius:14, padding:'18px 22px', transition:'all 0.25s', boxShadow: isEdit ? `0 0 0 3px ${T.accent}08` : 'none' } },
                // Header
                React.createElement('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, gap:12 } },
                  React.createElement('div', { style: { flex:1 } },
                    React.createElement('div', { style: { display:'flex', alignItems:'center', gap:10, marginBottom:4 } },
                      React.createElement('span', { style: { fontFamily: T.mono, fontSize:10, color: T.accent, fontWeight:600, background: T.accentBg, padding:'2px 8px', borderRadius:5, border:`1px solid ${T.accentBorder}` } }, f.id),
                      React.createElement('span', { style: { fontFamily: T.sans, fontSize:14, fontWeight:700, color: T.text } }, f.name),
                      React.createElement('span', { style: { fontFamily: T.mono, fontSize:11, color: T.textDim, background: T.bgSubtle, padding:'2px 8px', borderRadius:5 } }, f.output),
                    ),
                    React.createElement('div', { style: { fontFamily: T.sans, fontSize:11, color: T.textDim, fontWeight:500 } }, f.desc),
                  ),
                  React.createElement('button', {
                    onClick: () => setEditId(isEdit ? null : f.id),
                    style: { padding:'6px 16px', borderRadius:8, background: isEdit ? T.accent+'12' : T.bgSubtle, border:`1px solid ${isEdit ? T.accent+'25' : T.border}`, color: isEdit ? T.accent : T.textMid, fontFamily: T.sans, fontSize:11, fontWeight:650, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }
                  }, isEdit ? '✓ Done' : 'Edit'),
                ),

                // Formula expression
                React.createElement('div', { style: { display:'flex', flexWrap:'wrap', gap:5, alignItems:'center', padding:'14px 16px', background: T.bgInset, borderRadius:10, border:`1px dashed ${isEdit ? T.accent+'25' : T.border}`, minHeight:44 } },
                  React.createElement('span', { style: { fontFamily: T.mono, fontSize:12, color: T.textDim, marginRight:6, fontWeight:600 } }, `${f.output} =`),
                  f.blocks.length === 0 && React.createElement('span', { style: { fontFamily: T.sans, fontSize:12, color: T.textFaint, fontStyle:'italic' } }, 'Drop fields and operations here…'),
                  f.blocks.map((b, i) => React.createElement(Block, { key: i, block: b })),
                ),

                // Edit palette
                isEdit && React.createElement(Fade, { style: { marginTop:16 } },
                  React.createElement('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 } },
                    // LEFT: Raw Zoho Fields
                    React.createElement('div', { style: { background: T.bgInset, borderRadius:12, padding:16, border:`1px solid ${T.border}` } },
                      React.createElement('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 } },
                        React.createElement('div', { style: { fontFamily: T.sans, fontSize:11, fontWeight:700, color: T.text, textTransform:'uppercase', letterSpacing:1 } }, 'Zoho Database Fields'),
                        React.createElement('span', { style: { fontFamily: T.sans, fontSize:10, color: T.textFaint, fontWeight:500 } }, `${filteredFields.length} fields`),
                      ),
                      // Filter
                      React.createElement('div', { style: { display:'flex', gap:6, marginBottom:10 } },
                        React.createElement('input', { placeholder:'Filter fields…', value: fieldFilter, onChange: e => setFieldFilter(e.target.value), style: { flex:1, padding:'6px 10px', background: T.bgCard, border:`1px solid ${T.border}`, borderRadius:7, fontFamily: T.sans, fontSize:11, color: T.text, outline:'none' } }),
                        React.createElement('select', { value: fieldTable, onChange: e => setFieldTable(e.target.value), style: { padding:'6px 10px', background: T.bgCard, border:`1px solid ${T.border}`, borderRadius:7, fontFamily: T.sans, fontSize:11, color: T.text, cursor:'pointer' } },
                          React.createElement('option', { value:'All' }, 'All Tables'),
                          FIELD_TABLES.map(t => React.createElement('option', { key:t, value:t }, t)),
                        ),
                      ),
                      // Field list
                      React.createElement('div', { style: { maxHeight:220, overflow:'auto', display:'flex', flexDirection:'column', gap:3 } },
                        filteredFields.map(field =>
                          React.createElement('button', {
                            key: field.key,
                            onClick: () => { addBlock(f.id, {t:'field', v: field.key}); flash(`Added ${field.label}`); },
                            style: { display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background: T.bgCard, border:`1px solid ${T.border}`, borderRadius:8, cursor:'pointer', transition:'all 0.12s', textAlign:'left', width:'100%' },
                            onMouseEnter: e => { e.currentTarget.style.borderColor = BLOCK_STYLE.field.color+'40'; e.currentTarget.style.background = BLOCK_STYLE.field.bg; },
                            onMouseLeave: e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; },
                          },
                            React.createElement('span', { style: { width:22, height:22, borderRadius:6, background: T.bgSubtle, display:'flex', alignItems:'center', justifyContent:'center', fontFamily: T.mono, fontSize:10, color: T.textDim, fontWeight:600, flexShrink:0 } }, TYPE_ICONS[field.type] || '?'),
                            React.createElement('div', { style: { flex:1, minWidth:0 } },
                              React.createElement('div', { style: { fontFamily: T.sans, fontSize:12, fontWeight:600, color: T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, field.label),
                              React.createElement('div', { style: { fontFamily: T.mono, fontSize:9, color: T.textFaint } }, `${field.table}.${field.key}`),
                            ),
                            React.createElement('span', { style: { fontSize:14, color: T.textFaint } }, '+'),
                          ),
                        ),
                      ),
                    ),

                    // RIGHT: Operations + Conditions + Actions
                    React.createElement('div', { style: { display:'flex', flexDirection:'column', gap:12 } },
                      // Operations
                      ...['aggregate','logic','math','compare','date'].map(cat => {
                        const ops = OPERATIONS.filter(o => o.cat === cat);
                        const catLabel = { aggregate:'Aggregate', logic:'Logic', math:'Math', compare:'Compare', date:'Date' }[cat];
                        return React.createElement('div', { key: cat, style: { background: T.bgInset, borderRadius:10, padding:'12px 14px', border:`1px solid ${T.border}` } },
                          React.createElement('div', { style: { fontFamily: T.sans, fontSize:9, fontWeight:700, color: T.textDim, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 } }, catLabel),
                          React.createElement('div', { style: { display:'flex', flexWrap:'wrap', gap:4 } },
                            ops.map(op => {
                              const bs = BLOCK_STYLE.op;
                              return React.createElement('button', {
                                key: op.key,
                                onClick: () => { addBlock(f.id, {t: cat==='math'?'math':cat==='compare'?'cmp':cat==='logic'?'logic':'op', v: op.label}); flash('Added'); },
                                title: op.desc || '',
                                style: { padding:'4px 10px', borderRadius:6, background: bs.bg, color: bs.color, border:`1px solid ${bs.border}`, fontFamily: op.label.length <= 2 ? T.mono : T.sans, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.12s' },
                                onMouseEnter: e => e.target.style.background = bs.color+'15',
                                onMouseLeave: e => e.target.style.background = bs.bg,
                              }, op.label);
                            }),
                          ),
                        );
                      }),
                      // Value input
                      React.createElement('div', { style: { display:'flex', gap:6 } },
                        React.createElement('input', { id:`val-${f.id}`, placeholder:'Enter value…', style: { flex:1, ...inp({width:'auto', textAlign:'left', fontFamily: T.sans, fontSize:12}) },
                          onKeyDown: e => { if(e.key==='Enter' && e.target.value.trim()) { addBlock(f.id, {t:'val', v: e.target.value.trim()}); e.target.value=''; flash('Value added'); } }
                        }),
                        React.createElement('button', { onClick: () => { const el=document.getElementById(`val-${f.id}`); if(el&&el.value.trim()){addBlock(f.id,{t:'val',v:el.value.trim()});el.value='';flash('Value added');} }, style: { padding:'8px 14px', borderRadius:8, background: BLOCK_STYLE.val.bg, border:`1px solid ${BLOCK_STYLE.val.border}`, color: BLOCK_STYLE.val.color, fontFamily: T.sans, fontSize:11, fontWeight:600, cursor:'pointer' } }, '+ Value'),
                        React.createElement('button', { onClick: () => { addBlock(f.id, {t:'paren', v:'('}); }, style: { padding:'8px 10px', borderRadius:8, background: T.bgSubtle, border:`1px solid ${T.border}`, color: T.textMid, fontFamily: T.mono, fontSize:13, cursor:'pointer' } }, '('),
                        React.createElement('button', { onClick: () => { addBlock(f.id, {t:'paren', v:')'}); }, style: { padding:'8px 10px', borderRadius:8, background: T.bgSubtle, border:`1px solid ${T.border}`, color: T.textMid, fontFamily: T.mono, fontSize:13, cursor:'pointer' } }, ')'),
                      ),
                      // Actions
                      React.createElement('div', { style: { display:'flex', gap:6 } },
                        React.createElement('button', { onClick: () => { popBlock(f.id); flash('Removed'); }, style: { padding:'7px 14px', borderRadius:8, background: T.criticalBg, border:`1px solid ${T.critical}15`, color: T.critical, fontFamily: T.sans, fontSize:11, fontWeight:600, cursor:'pointer' } }, '← Undo Last'),
                        React.createElement('button', { onClick: () => { clearBlocks(f.id); flash('Cleared'); }, style: { padding:'7px 14px', borderRadius:8, background: T.bgSubtle, border:`1px solid ${T.border}`, color: T.textDim, fontFamily: T.sans, fontSize:11, fontWeight:600, cursor:'pointer' } }, 'Clear All'),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),

      // ═══ RULES ═══
      tab === 'rules' && React.createElement('div', null,
        React.createElement('div', { style: { display:'grid', gridTemplateColumns:'36px 1fr 1.2fr 80px 80px 90px 46px', gap:10, padding:'0 0 10px', borderBottom:`1px solid ${T.border}`, marginBottom:6 } },
          ['','Rule','Description','Threshold','Gate','Severity',''].map((h,i) => React.createElement('span', { key:i, style: { fontFamily: T.sans, fontSize:9, color: T.textFaint, fontWeight:700, textTransform:'uppercase', letterSpacing:1 } }, h)),
        ),
        rules.map(r => React.createElement(Fade, { key: r.id },
          React.createElement('div', { style: { display:'grid', gridTemplateColumns:'36px 1fr 1.2fr 80px 80px 90px 46px', gap:10, padding:'12px 0', borderBottom:`1px solid ${T.borderLight}`, alignItems:'center', opacity: r.on ? 1 : 0.35, transition:'opacity 0.25s' } },
            React.createElement('span', { style: { fontFamily: T.mono, fontSize:10, color: SEV_MAP[r.sev], fontWeight:700 } }, r.id.replace('RF0','')),
            React.createElement('span', { style: { fontFamily: T.sans, fontSize:13, fontWeight:650, color: T.text } }, r.name),
            React.createElement('span', { style: { fontFamily: T.sans, fontSize:11, color: T.textDim, fontWeight:500, lineHeight:1.4 } }, r.desc),
            r.val !== null ? React.createElement('div', { style: { display:'flex', alignItems:'center', gap:3 } },
              React.createElement('input', { type:'number', value: r.val, onChange: e => { upRule(r.id,'val',+e.target.value); flash('Updated'); }, style: inp() }),
              r.pct && React.createElement('span', { style: { fontFamily: T.mono, fontSize:11, color: T.textDim } }, '%'),
            ) : React.createElement('span', { style: { color: T.textFaint, fontSize:11 } }, '—'),
            r.gate !== null ? React.createElement('input', { type:'number', value: r.gate, onChange: e => { upRule(r.id,'gate',+e.target.value); flash('Updated'); }, style: inp() }) : React.createElement('span', { style: { color: T.textFaint, fontSize:11 } }, '—'),
            React.createElement('select', { value: r.sev, onChange: e => { upRule(r.id,'sev',e.target.value); flash('Updated'); }, style: { ...inp({width:84, fontFamily: T.sans, textAlign:'left', cursor:'pointer'}), color: SEV_MAP[r.sev] } },
              ['critical','high','medium','low'].map(s => React.createElement('option', { key:s, value:s }, s)),
            ),
            React.createElement(ToggleSwitch, { on: r.on, onChange: () => { upRule(r.id,'on',!r.on); flash(r.on?'Disabled':'Enabled'); } }),
          ),
        )),
      ),

      // ═══ TIERS ═══
      tab === 'tiers' && React.createElement('div', null,
        React.createElement('p', { style: { fontFamily: T.sans, fontSize:13, color: T.textDim, fontWeight:500, marginBottom:24 } }, 'Configure how many red flags trigger each recommendation tier:'),
        React.createElement('div', { style: { display:'flex', flexDirection:'column', gap:10, maxWidth:560 } },
          [{k:'watch',l:'WATCH',c:T.watch,d:'Monitor weekly'},{k:'escalate',l:'ESCALATE',c:T.escalate,d:'Management call 48hrs'},{k:'critical',l:'CRITICAL',c:T.critical,d:'Recommend postpone/kill'}].map(t =>
            React.createElement('div', { key:t.k, style: { display:'flex', alignItems:'center', gap:14, padding:'16px 20px', background: T.bgInset, borderRadius:12, border:`1px solid ${T.border}` } },
              React.createElement('span', { style: { width:8, height:8, borderRadius:'50%', background: t.c, flexShrink:0 } }),
              React.createElement('span', { style: { fontFamily: T.sans, fontWeight:700, fontSize:13, color: t.c, minWidth:80 } }, t.l),
              React.createElement('span', { style: { fontFamily: T.sans, fontSize:12, color: T.textDim, flex:1, fontWeight:500 } }, t.d),
              React.createElement('span', { style: { fontFamily: T.sans, fontSize:11, color: T.textDim } }, '≥'),
              React.createElement('input', { type:'number', value: tiers[t.k], min:1, onChange: e => { setTiers(p=>({...p,[t.k]:+e.target.value})); flash('Updated'); }, style: inp({width:50}) }),
              React.createElement('span', { style: { fontFamily: T.sans, fontSize:11, color: T.textDim } }, 'flags'),
            ),
          ),
        ),
        React.createElement('div', { style: { marginTop:28 } },
          React.createElement(SectionHead, { title: 'Benchmarks' }),
          React.createElement('div', { style: { display:'flex', flexDirection:'column', gap:10, maxWidth:560 } },
            [['Payment Benchmark','Minimum paid delegates for "safe"',30],['Break-Even Delegates','Minimum for event viability',40]].map(([l,d,v]) =>
              React.createElement('div', { key:l, style: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background: T.bgInset, borderRadius:12, border:`1px solid ${T.border}` } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: T.sans, fontWeight:650, fontSize:13, color: T.text } }, l),
                  React.createElement('div', { style: { fontFamily: T.sans, fontSize:11, color: T.textDim, marginTop:2, fontWeight:500 } }, d),
                ),
                React.createElement('input', { type:'number', defaultValue:v, onChange: () => flash('Updated'), style: inp({width:54}) }),
              ),
            ),
          ),
        ),
      ),

      // ═══ DROPDOWNS ═══
      tab === 'dropdowns' && React.createElement('div', null,
        [{title:'Event Statuses',items:statuses,setItems:setStatuses,nv:newStatus,sn:setNewStatus,cm:STATUS_MAP,mono:false},
         {title:'Market Rep Codes',items:reps,setItems:setReps,nv:newRep,sn:setNewRep,cm:{},mono:true}].map(g =>
          React.createElement('div', { key:g.title, style: { marginBottom:28 } },
            React.createElement('h4', { style: { fontFamily: T.sans, fontSize:14, fontWeight:700, color: T.text, marginBottom:12 } }, g.title),
            React.createElement('div', { style: { display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 } },
              g.items.map(s => React.createElement('div', { key:s, style: { display:'flex', alignItems:'center', gap:7, padding:'7px 14px', background: T.bgInset, border:`1px solid ${T.border}`, borderRadius:8, transition:'border-color 0.15s' }, onMouseEnter: e => e.currentTarget.style.borderColor = T.borderHover, onMouseLeave: e => e.currentTarget.style.borderColor = T.border },
                g.cm[s] && React.createElement('span', { style: { width:7, height:7, borderRadius:'50%', background: g.cm[s] } }),
                React.createElement('span', { style: { fontFamily: g.mono ? T.mono : T.sans, fontSize:13, color: T.text, fontWeight: g.mono ? 600 : 500 } }, s),
                React.createElement('button', { onClick: () => { g.setItems(p => p.filter(x => x !== s)); flash('Removed'); }, style: { background:'none', border:'none', color: T.textFaint, cursor:'pointer', fontSize:15, padding:'0 2px', lineHeight:1, transition:'color 0.15s' }, onMouseEnter: e => e.target.style.color = T.critical, onMouseLeave: e => e.target.style.color = T.textFaint }, '×'),
              )),
            ),
            React.createElement('div', { style: { display:'flex', gap:8 } },
              React.createElement('input', { placeholder:`Add ${g.title.toLowerCase()}…`, value: g.nv, onChange: e => g.sn(e.target.value), style: inp({width:200, textAlign:'left', fontFamily: g.mono ? T.mono : T.sans, fontSize:12}), onKeyDown: e => { if(e.key==='Enter'&&g.nv.trim()){g.setItems(p=>[...p,g.mono?g.nv.trim().toUpperCase():g.nv.trim()]);g.sn('');flash('Added');} } }),
              React.createElement('button', { onClick: () => { if(g.nv.trim()){g.setItems(p=>[...p,g.mono?g.nv.trim().toUpperCase():g.nv.trim()]);g.sn('');flash('Added');} }, style: { padding:'8px 18px', background: T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:8, color: T.accent, fontFamily: T.sans, fontSize:12, fontWeight:650, cursor:'pointer' } }, '+ Add'),
            ),
          ),
        ),
      ),
    ),
  );
};

Object.assign(window, { AdminPanel3 });
