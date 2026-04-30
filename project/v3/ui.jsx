// EPM v3 — Shared UI Primitives (Refined)

const useAnimNum = (target, dur = 400) => {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    let s = null, from = v;
    const step = ts => { if (!s) s = ts; const p = Math.min((ts - s) / dur, 1); setV(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [target]);
  return v;
};

const Fade = ({ children, delay = 0, style = {} }) => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, []);
  return React.createElement('div', { style: { ...style, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(4px)', transition: 'opacity 0.25s ease, transform 0.25s ease' } }, children);
};

const StatusBadge = ({ rec, size = 'md' }) => {
  const m = REC_MAP[rec] || { color: T.textDim, bg: T.bgSubtle, label: rec };
  const sm = size === 'sm';
  return React.createElement('span', {
    style: { fontFamily: T.sans, fontWeight: 700, fontSize: sm ? 9 : 10, padding: sm ? '2px 6px' : '3px 8px', borderRadius: 4, background: m.bg, color: m.color, letterSpacing: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'inline-block' }
  }, m.label);
};

const Num = ({ value, size = 18, color, mono = true }) => {
  const anim = useAnimNum(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? anim : value;
  return React.createElement('span', {
    style: { fontFamily: mono ? T.mono : T.sans, fontSize: size, fontWeight: 700, color: color || T.text, letterSpacing: -0.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }
  }, display);
};

const Metric = ({ label, value, sub, warn, large }) => {
  const anim = useAnimNum(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? anim : value;
  return React.createElement('div', { style: { padding: large ? '14px 16px' : '10px 14px' } },
    React.createElement('div', { style: { fontFamily: T.sans, fontSize: 10, color: T.textDim, fontWeight: 500, marginBottom: 4, letterSpacing: 0.1 } }, label),
    React.createElement('div', { style: { fontFamily: T.mono, fontSize: large ? 24 : 18, fontWeight: 700, color: warn || T.text, lineHeight: 1, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' } }, display),
    sub && React.createElement('div', { style: { fontFamily: T.sans, fontSize: 10, color: T.textDim, marginTop: 4 } }, sub),
  );
};

const MetricCard = ({ label, value, sub, warn, large }) => {
  return React.createElement('div', {
    style: { background: T.bgCard, borderRadius: 8, padding: large ? '14px 16px' : '10px 14px', boxShadow: T.shadow1, transition: 'box-shadow 0.15s' },
    onMouseEnter: e => e.currentTarget.style.boxShadow = T.shadow2,
    onMouseLeave: e => e.currentTarget.style.boxShadow = T.shadow1,
  },
    React.createElement(Metric, { label, value, sub, warn, large }),
  );
};

const SectionHead = ({ title, right }) => React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
  React.createElement('h3', { style: { fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.text, margin: 0, letterSpacing: -0.2 } }, title),
  right,
);

const VelChart = ({ data, label }) => {
  const keys = ['today','yesterday','d7','d14','d21'];
  const labels = ['Today','Yest','7d','14d','21d'];
  const max = Math.max(...keys.map(k => data[k]), 1);
  const trend = data.d7 > data.d14 ? 'up' : data.d7 < data.d14 ? 'down' : 'flat';
  return React.createElement('div', { style: { background: T.bgCard, borderRadius: 10, padding: 16, boxShadow: T.shadow1 } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
      React.createElement('span', { style: { fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: -0.2 } }, label),
      React.createElement('span', { style: { fontSize: 10, fontFamily: T.sans, fontWeight: 600, color: trend === 'up' ? T.go : trend === 'down' ? T.escalate : T.textDim } },
        trend === 'up' ? '↑ Accelerating' : trend === 'down' ? '↓ Declining' : '— Flat'),
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 } },
      keys.map((k, i) => {
        const v = data[k], h = Math.max((v / max) * 48, 2), hot = i <= 1;
        return React.createElement('div', { key: k, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 } },
          React.createElement('span', { style: { fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: hot ? T.text : T.textDim, fontVariantNumeric: 'tabular-nums' } }, v),
          React.createElement('div', { style: { width: '60%', maxWidth: 26, height: h, borderRadius: 4, background: hot ? T.accent : T.bgSubtle, transition: 'height 0.3s ease' } }),
          React.createElement('span', { style: { fontFamily: T.sans, fontSize: 9, color: T.textFaint, fontWeight: 500 } }, labels[i]),
        );
      }),
    ),
  );
};

const ToggleSwitch = ({ on, onChange }) => React.createElement('div', {
  onClick: onChange,
  style: { width: 32, height: 18, borderRadius: 9, background: on ? T.accent : T.bgSubtle, border: `1px solid ${on ? T.accent : T.border}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }
},
  React.createElement('div', { style: { width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 1, left: on ? 15 : 1, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' } })
);

Object.assign(window, { useAnimNum, Fade, StatusBadge, Num, Metric, MetricCard, SectionHead, VelChart, ToggleSwitch });
