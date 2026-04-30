'use client';

import { REC_MAP, T } from '@/lib/tokens';
import type { Recommendation } from '@/types';

interface Props {
  rec: Recommendation | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ rec, size = 'md' }: Props) {
  const m = REC_MAP[rec] ?? { color: T.textDim, bg: T.bgSubtle, label: rec };
  const sm = size === 'sm';
  return (
    <span
      style={{
        fontFamily: T.sans,
        fontWeight: 700,
        fontSize: sm ? 9 : 10,
        padding: sm ? '2px 6px' : '3px 8px',
        borderRadius: 4,
        background: m.bg,
        color: m.color,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {m.label}
    </span>
  );
}
