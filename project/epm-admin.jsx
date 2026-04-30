// Admin Panel Component
const AdminPanel = () => {
  const [rules, setRules] = React.useState(DEFAULT_RED_FLAG_RULES.map(r => ({...r})));
  const [tiers, setTiers] = React.useState({...DEFAULT_DECISION_TIERS});
  const [statuses, setStatuses] = React.useState(['Going Ahead','Standby','Postponed','Postpone','Cancelled']);
  const [reps, setReps] = React.useState(['VV','PM','PT','JS']);
  const [newStatus, setNewStatus] = React.useState('');
  const [newRep, setNewRep] = React.useState('');
  const [tab, setTab] = React.useState('rules');
  const [toast, setToast] = React.useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const updateRule = (id, field, value) => {
    setRules(prev => prev.map(r => r.id === id ? {...r, [field]: value} : r));
  };

  const tabStyle = (active) => ({
    padding: '10px 20px', fontFamily: 'Outfit', fontSize: 13, fontWeight: 600,
    background: active ? '#1e2a3a' : 'transparent', color: active ? '#e1e4e8' : '#586374',
    border: '1px solid #1e2a3a', borderBottom: active ? '1px solid #0d1320' : '1px solid #1e2a3a',
    cursor: 'pointer', borderRadius: '8px 8px 0 0', marginBottom: -1, position: 'relative', zIndex: active ? 2 : 1,
  });

  const inputStyle = {
    padding: '8px 12px', background: '#080c14', border: '1px solid #1e2a3a', borderRadius: 6,
    color: '#e1e4e8', fontFamily: 'JetBrains Mono', fontSize: 13, width: 70, textAlign: 'center',
  };

  const selectStyle = {
    ...inputStyle, width: 100, fontFamily: 'Outfit', cursor: 'pointer', textAlign: 'left',
  };

  return React.createElement('div', { style: { padding: '0 32px 32px' } },
    // Toast
    toast && React.createElement('div', { style: { position: 'fixed', top: 80, right: 32, background: '#00E676', color: '#080c14', padding: '10px 20px', borderRadius: 8, fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, zIndex: 100, animation: 'fadeIn 0.2s' } }, toast),

    React.createElement('div', { style: { marginBottom: 8 } },
      React.createElement('h2', { style: { fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, color: '#e1e4e8', margin: 0 } }, 'Rules Engine Configuration'),
      React.createElement('p', { style: { fontFamily: 'Outfit', fontSize: 12, color: '#586374', margin: '4px 0 0' } }, 'Edit thresholds, toggle rules, manage dropdowns — changes recalculate instantly.')
    ),

    // Tabs
    React.createElement('div', { style: { display: 'flex', gap: 0, marginBottom: 0 } },
      ['rules', 'tiers', 'dropdowns'].map(t =>
        React.createElement('button', { key: t, onClick: () => setTab(t), style: tabStyle(tab === t) },
          t === 'rules' ? 'Red Flag Rules' : t === 'tiers' ? 'Decision Tiers' : 'Dropdown Manager')
      )
    ),

    React.createElement('div', { style: { background: '#0d1320', border: '1px solid #1e2a3a', borderRadius: '0 8px 8px 8px', padding: 24 } },

      // === RULES TAB ===
      tab === 'rules' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '40px 1fr 200px 90px 90px 100px 60px', gap: 12, padding: '0 0 10px', borderBottom: '1px solid #1e2a3a', marginBottom: 8 } },
          ...['', 'Rule', 'Description', 'Threshold', 'Gate (wks)', 'Severity', 'On'].map((h, i) =>
            React.createElement('span', { key: i, style: { fontFamily: 'Outfit', fontSize: 10, color: '#586374', textTransform: 'uppercase', letterSpacing: 1 } }, h)
          )
        ),
        rules.map(rule =>
          React.createElement('div', {
            key: rule.id,
            style: { display: 'grid', gridTemplateColumns: '40px 1fr 200px 90px 90px 100px 60px', gap: 12, padding: '12px 0', borderBottom: '1px solid #1e2a3a10', alignItems: 'center', opacity: rule.enabled ? 1 : 0.4, transition: 'opacity 0.2s' }
          },
            React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 11, color: SEVERITY_COLORS[rule.severity], fontWeight: 600 } }, rule.id.replace('RF0', '')),
            React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: '#e1e4e8' } }, rule.name),
            React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374', lineHeight: 1.4 } }, rule.description),
            // Threshold
            rule.thresholdValue !== null ?
              React.createElement('div', { style: { position: 'relative', display: 'inline-flex', alignItems: 'center' } },
                React.createElement('input', {
                  type: 'number', value: rule.thresholdValue,
                  onChange: e => { updateRule(rule.id, 'thresholdValue', Number(e.target.value)); showToast('Threshold updated'); },
                  style: inputStyle
                }),
                rule.isPercent && React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 11, color: '#586374', marginLeft: 4 } }, '%')
              ) :
              React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#2a3444' } }, '—'),
            // Gate
            rule.gateWeeksOut !== null ?
              React.createElement('input', {
                type: 'number', value: rule.gateWeeksOut,
                onChange: e => { updateRule(rule.id, 'gateWeeksOut', Number(e.target.value)); showToast('Gate updated'); },
                style: inputStyle
              }) :
              React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#2a3444' } }, '—'),
            // Severity
            React.createElement('select', {
              value: rule.severity, onChange: e => { updateRule(rule.id, 'severity', e.target.value); showToast('Severity updated'); },
              style: { ...selectStyle, color: SEVERITY_COLORS[rule.severity] }
            },
              ['critical', 'high', 'medium', 'low'].map(s =>
                React.createElement('option', { key: s, value: s }, s)
              )
            ),
            // Toggle
            React.createElement('div', {
              onClick: () => { updateRule(rule.id, 'enabled', !rule.enabled); showToast(rule.enabled ? 'Rule disabled' : 'Rule enabled'); },
              style: { width: 40, height: 22, borderRadius: 11, background: rule.enabled ? '#00E676' : '#1e2a3a', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }
            },
              React.createElement('div', { style: { width: 18, height: 18, borderRadius: '50%', background: '#e1e4e8', position: 'absolute', top: 2, left: rule.enabled ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px #0004' } })
            )
          )
        )
      ),

      // === TIERS TAB ===
      tab === 'tiers' && React.createElement('div', null,
        React.createElement('p', { style: { fontFamily: 'Outfit', fontSize: 13, color: '#586374', marginBottom: 20 } }, 'How many red flags trigger each recommendation tier:'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 } },
          [
            { key: 'watch', label: 'WATCH', color: '#FFD740', desc: 'Monitor weekly' },
            { key: 'escalate', label: 'ESCALATE', color: '#FF6E40', desc: 'Management call within 48hrs' },
            { key: 'critical', label: 'CRITICAL', color: '#FF1744', desc: 'Recommend postpone/kill' },
          ].map(tier =>
            React.createElement('div', { key: tier.key, style: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#080c14', borderRadius: 8, border: '1px solid #1e2a3a' } },
              React.createElement('span', { style: { fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: tier.color, minWidth: 90 } }, tier.label),
              React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 12, color: '#586374', flex: 1 } }, tier.desc),
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374' } }, '≥'),
                React.createElement('input', {
                  type: 'number', value: tiers[tier.key], min: 1, max: 13,
                  onChange: e => { setTiers(prev => ({...prev, [tier.key]: Number(e.target.value)})); showToast('Tier boundary updated'); },
                  style: { ...inputStyle, width: 55 }
                }),
                React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374' } }, 'flags')
              )
            )
          )
        ),
        // Payment benchmark
        React.createElement('div', { style: { marginTop: 24, padding: '16px 20px', background: '#080c14', borderRadius: 8, border: '1px solid #1e2a3a', maxWidth: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: '#e1e4e8' } }, 'Payment Benchmark'),
            React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374', marginTop: 2 } }, 'Minimum paid delegates to be considered "safe"')
          ),
          React.createElement('input', { type: 'number', defaultValue: 30, style: { ...inputStyle, width: 55 }, onChange: () => showToast('Benchmark updated') })
        ),
        React.createElement('div', { style: { marginTop: 12, padding: '16px 20px', background: '#080c14', borderRadius: 8, border: '1px solid #1e2a3a', maxWidth: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: '#e1e4e8' } }, 'Break-Even Delegates'),
            React.createElement('div', { style: { fontFamily: 'Outfit', fontSize: 11, color: '#586374', marginTop: 2 } }, 'Minimum delegate count for event viability')
          ),
          React.createElement('input', { type: 'number', defaultValue: 40, style: { ...inputStyle, width: 55 }, onChange: () => showToast('Break-even updated') })
        )
      ),

      // === DROPDOWNS TAB ===
      tab === 'dropdowns' && React.createElement('div', null,
        // Event Statuses
        React.createElement('div', { style: { marginBottom: 28 } },
          React.createElement('h4', { style: { fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#e1e4e8', marginBottom: 12 } }, 'Event Statuses'),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 } },
            statuses.map(s =>
              React.createElement('div', { key: s, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#080c14', border: '1px solid #1e2a3a', borderRadius: 6 } },
                React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] || '#586374' } }),
                React.createElement('span', { style: { fontFamily: 'Outfit', fontSize: 13, color: '#e1e4e8' } }, s),
                React.createElement('button', {
                  onClick: () => { setStatuses(prev => prev.filter(x => x !== s)); showToast('Status removed'); },
                  style: { background: 'none', border: 'none', color: '#586374', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }
                }, '×')
              )
            )
          ),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('input', { placeholder: 'New status...', value: newStatus, onChange: e => setNewStatus(e.target.value), style: { ...inputStyle, width: 200, textAlign: 'left', fontFamily: 'Outfit' } }),
            React.createElement('button', {
              onClick: () => { if (newStatus.trim()) { setStatuses(prev => [...prev, newStatus.trim()]); setNewStatus(''); showToast('Status added'); } },
              style: { padding: '8px 16px', background: '#1e2a3a', border: '1px solid #2a3a50', borderRadius: 6, color: '#e1e4e8', fontFamily: 'Outfit', fontSize: 12, cursor: 'pointer' }
            }, '+ Add')
          )
        ),
        // Market Reps
        React.createElement('div', null,
          React.createElement('h4', { style: { fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#e1e4e8', marginBottom: 12 } }, 'Market Rep Codes'),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 } },
            reps.map(r =>
              React.createElement('div', { key: r, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#080c14', border: '1px solid #1e2a3a', borderRadius: 6 } },
                React.createElement('span', { style: { fontFamily: 'JetBrains Mono', fontSize: 13, color: '#e1e4e8', fontWeight: 600 } }, r),
                React.createElement('button', {
                  onClick: () => { setReps(prev => prev.filter(x => x !== r)); showToast('Rep removed'); },
                  style: { background: 'none', border: 'none', color: '#586374', cursor: 'pointer', fontSize: 14, padding: '0 2px' }
                }, '×')
              )
            )
          ),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('input', { placeholder: 'New rep code...', value: newRep, onChange: e => setNewRep(e.target.value), maxLength: 4, style: { ...inputStyle, width: 100, textAlign: 'left', fontFamily: 'JetBrains Mono' } }),
            React.createElement('button', {
              onClick: () => { if (newRep.trim()) { setReps(prev => [...prev, newRep.trim().toUpperCase()]); setNewRep(''); showToast('Rep added'); } },
              style: { padding: '8px 16px', background: '#1e2a3a', border: '1px solid #2a3a50', borderRadius: 6, color: '#e1e4e8', fontFamily: 'Outfit', fontSize: 12, cursor: 'pointer' }
            }, '+ Add')
          )
        )
      )
    )
  );
};

Object.assign(window, { AdminPanel });
