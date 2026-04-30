'use client';

import { T } from '@/lib/tokens';

interface Props {
  label: string;
  value: number | string;
  sub?: string;
  warn?: string | null;
  large?: boolean;
}

export function Metric({ label, value, sub, warn, large }: Props) {
  return (
    <div style={{ padding: large ? '14px 16px' : '10px 14px' }}>
      <div
        style={{
          fontFamily: T.sans,
          fontSize: 10,
          color: T.textDim,
          fontWeight: 500,
          marginBottom: 4,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: large ? 24 : 18,
          fontWeight: 700,
          color: warn ?? T.text,
          lineHeight: 1,
          letterSpacing: -0.5,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textDim, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function MetricCard({ label, value, sub, warn, large }: Props) {
  return (
    <div
      style={{
        background: T.bgCard,
        borderRadius: 8,
        padding: large ? '14px 16px' : '10px 14px',
        boxShadow: T.shadow1,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadow2;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadow1;
      }}
    >
      <Metric label={label} value={value} sub={sub} warn={warn} large={large} />
    </div>
  );
}
