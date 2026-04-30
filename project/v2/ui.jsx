// EPM v2 — Shared UI primitives
const useAnimatedNumber = (target, duration = 600) => {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = null, from = val;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
};

const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, []);
  return React.createElement('div', {
    style: { ...style, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }
  }, children);
};

const Glow = ({ color, size = 120, style = {} }) => React.createElement('div', {
  style: { position: 'absolute', width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(30px)', ...style }
});

const Badge = ({ label, color, size = 'md' }) => {
  const s = size === 'sm' ? { fontSize: 9, padding: '2px 8px', letterSpacing: 1 } : size === 'lg' ? { fontSize: 13, padding: '6px 16px', letterSpacing: 1 } : { fontSize: 10, padding: '4px 11px', letterSpacing: 0.8 };
  return React.createElement('span', {
    style: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, borderRadius: 5, background: color + '14', color, border: `1px solid ${color}30`, display: 'inline-block', textTransform: 'uppercase', whiteSpace: 'nowrap', ...s }
  }, label);
};

const KPITile = ({ label, value, sub, warn, glow, big }) => {
  const animVal = useAnimatedNumber(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? animVal : value;
  return React.createElement('div', {
    style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: big ? '20px 24px' : '14px 18px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' },
    onMouseEnter: (e) => e.currentTarget.style.borderColor = C.borderLight,
    onMouseLeave: (e) => e.currentTarget.style.borderColor = C.border,
  },
    glow && React.createElement(Glow, { color: warn || C.accent, size: 80, style: { top: -20, right: -20 } }),
    React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 } }, label),
    React.createElement('div', { style: { fontFamily: "'JetBrains Mono'", fontSize: big ? 34 : 24, fontWeight: 700, color: warn || C.text, lineHeight: 1, position: 'relative' } }, display),
    sub && React.createElement('div', { style: { fontFamily: "'Space Grotesk'", fontSize: 11, color: C.textDim, marginTop: 6 } }, sub),
  );
};

const Section = ({ title, children, cols, right }) => React.createElement('div', { style: { marginBottom: 28 } },
  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
    React.createElement('h3', { style: { fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, color: C.textMid, textTransform: 'uppercase', letterSpacing: 2, margin: 0 } }, title),
    right,
  ),
  React.createElement('div', { style: { display: 'grid', gridTemplateColumns: cols || 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 } }, children)
);

const VelocityBar = ({ data, label }) => {
  const keys = ['today','yesterday','d7','d14','d21'];
  const labels = ['Today','Yest','7d','14d','21d'];
  const max = Math.max(...keys.map(k => data[k]), 1);
  const trend = data.d7 > data.d14 ? 'up' : data.d7 < data.d14 ? 'down' : 'flat';
  const trendColor = trend === 'up' ? C.go : trend === 'down' ? C.escalate : C.textDim;

  return React.createElement('div', {
    style: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: 1.5 } }, label),
      React.createElement('span', { style: { fontSize: 11, color: trendColor, fontFamily: "'Space Grotesk'", fontWeight: 600 } },
        trend === 'up' ? '▲ Accelerating' : trend === 'down' ? '▼ Declining' : '— Flat'),
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 } },
      keys.map((k, i) => {
        const v = data[k], h = Math.max((v / max) * 72, 3);
        const isHot = i <= 1;
        const barColor = isHot ? (v > 0 ? C.accent : C.critical + '60') : C.border;
        return React.createElement('div', { key: k, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 } },
          React.createElement('span', { style: { fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 600, color: isHot ? C.text : C.textDim } }, v),
          React.createElement('div', { style: { width: '100%', maxWidth: 36, height: h, borderRadius: 4, background: barColor, transition: 'height 0.5s ease', position: 'relative', overflow: 'hidden' } },
            isHot && v > 0 && React.createElement('div', { style: { position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.accent}40 0%, ${C.accent}10 100%)`, borderRadius: 4 } }),
          ),
          React.createElement('span', { style: { fontFamily: "'Space Grotesk'", fontSize: 9, color: C.textDim, letterSpacing: 0.5 } }, labels[i]),
        );
      })
    ),
  );
};

const Toggle = ({ on, onChange }) => React.createElement('div', {
  onClick: onChange,
  style: { width: 38, height: 20, borderRadius: 10, background: on ? C.go : C.bg1, border: `1px solid ${on ? C.go + '60' : C.border}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }
},
  React.createElement('div', { style: { width: 16, height: 16, borderRadius: '50%', background: on ? '#fff' : C.textDim, position: 'absolute', top: 1, left: on ? 19 : 1, transition: 'left 0.2s', boxShadow: on ? `0 0 8px ${C.go}40` : 'none' } })
);

const Pulse = ({ color, size = 8 }) => React.createElement('span', {
  style: { display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 0 0 ${color}60`, animation: 'pulse 2s infinite' }
});

Object.assign(window, { useAnimatedNumber, FadeIn, Glow, Badge, KPITile, Section, VelocityBar, Toggle, Pulse });
