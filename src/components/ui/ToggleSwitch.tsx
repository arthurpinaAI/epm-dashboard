'use client';

import { T } from '@/lib/tokens';

interface Props {
  on: boolean;
  onChange: () => void;
}

export function ToggleSwitch({ on, onChange }: Props) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 32,
        height: 18,
        borderRadius: 9,
        background: on ? T.accent : T.bgSubtle,
        border: `1px solid ${on ? T.accent : T.border}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 1,
          left: on ? 15 : 1,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
}
