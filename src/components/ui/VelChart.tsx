'use client';

import { T } from '@/lib/tokens';
import type { VelocityData } from '@/types';

interface Props {
  data: VelocityData;
  label: string;
}

const KEYS: (keyof VelocityData)[] = ['today', 'yesterday', 'd7', 'd14', 'd21'];
const LABELS = ['Today', 'Yest', '7d', '14d', '21d'];

export function VelChart({ data, label }: Props) {
  const max = Math.max(...KEYS.map((k) => data[k]), 1);
  const trend = data.d7 > data.d14 ? 'up' : data.d7 < data.d14 ? 'down' : 'flat';

  return (
    <div
      style={{
        background: T.bgCard,
        borderRadius: 10,
        padding: 16,
        boxShadow: T.shadow1,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: T.sans,
            fontSize: 12,
            fontWeight: 700,
            color: T.text,
            letterSpacing: -0.2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: T.sans,
            fontWeight: 600,
            color:
              trend === 'up' ? T.go : trend === 'down' ? T.escalate : T.textDim,
          }}
        >
          {trend === 'up' ? '↑ Accelerating' : trend === 'down' ? '↓ Declining' : '— Flat'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
        {KEYS.map((k, i) => {
          const v = data[k];
          const h = Math.max((v / max) * 48, 2);
          const hot = i <= 1;
          return (
            <div
              key={k}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: hot ? T.text : T.textDim,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {v}
              </span>
              <div
                style={{
                  width: '60%',
                  maxWidth: 26,
                  height: h,
                  borderRadius: 4,
                  background: hot ? T.accent : T.bgSubtle,
                  transition: 'height 0.3s ease',
                }}
              />
              <span
                style={{
                  fontFamily: T.sans,
                  fontSize: 9,
                  color: T.textFaint,
                  fontWeight: 500,
                }}
              >
                {LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
