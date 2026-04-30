'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { T } from '@/lib/tokens';
import type { EventSummary } from '@/types';

interface Props {
  events: EventSummary[];
}

export function Header({ events }: Props) {
  const path = usePathname();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  const crit       = events.filter((e) => e.rec === 'CRITICAL').length;
  const esc        = events.filter((e) => e.rec === 'ESCALATE').length;
  const totalFlags = events.reduce((s, e) => s + e.flagCount, 0);

  const navLink = (href: string, label: string) => {
    const active = path === href || (href !== '/' && path.startsWith(href));
    return (
      <Link
        href={href}
        style={{
          padding: '0 0 2px',
          background: 'none',
          border: 'none',
          borderBottom: `1.5px solid ${active ? T.text : 'transparent'}`,
          fontFamily: T.sans,
          fontSize: 12,
          fontWeight: active ? 600 : 500,
          color: active ? T.text : T.textDim,
          cursor: 'pointer',
          transition: 'all 0.15s',
          letterSpacing: 0,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {label}
      </Link>
    );
  };

  const statPill = (val: number, label: string, color: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px 3px 7px',
        borderRadius: 4,
        background: val > 0 ? color + '08' : 'transparent',
        border: `1px solid ${val > 0 ? color + '15' : T.borderLight}`,
      }}
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 12,
          fontWeight: 700,
          color: val > 0 ? color : T.textFaint,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {val}
      </span>
      <span
        style={{
          fontFamily: T.sans,
          fontSize: 9,
          color: val > 0 ? color + 'bb' : T.textFaint,
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 46,
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(247,248,250,0.92)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <span
          style={{
            fontFamily: T.serif,
            fontWeight: 500,
            fontSize: 16,
            color: T.text,
            letterSpacing: -0.8,
            lineHeight: 1,
          }}
        >
          EPM
        </span>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {navLink('/', 'Fleet Overview')}
          {navLink('/admin', 'Rules Engine')}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {statPill(crit, 'crit', T.critical)}
        {statPill(esc, 'esc', T.escalate)}
        {statPill(totalFlags, 'flags', T.textMid)}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 4 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: T.go,
              boxShadow: `0 0 6px ${T.go}50`,
            }}
          />
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              color: T.textDim,
              fontWeight: 500,
            }}
          >
            {time}
          </span>
        </div>
      </div>
    </header>
  );
}
