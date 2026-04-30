'use client';

import { useState, useCallback } from 'react';
import { T, REC_MAP, STATUS_MAP } from '@/lib/tokens';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InlinePanel } from './InlinePanel';
import type { EventDetail, EventSummary } from '@/types';

interface Props {
  evt: EventSummary;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

export function EventRow({ evt, expanded, onToggle, isLast }: Props) {
  const [hovered, setHovered] = useState(false);
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const rm = REC_MAP[evt.rec] ?? {};

  const handleToggle = useCallback(async () => {
    onToggle();
    if (!expanded && !detail) {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(evt.code)}`);
        if (res.ok) setDetail(await res.json());
      } catch {
        // silently fail — inline panel shows summary data
      } finally {
        setLoading(false);
      }
    }
  }, [expanded, detail, evt.code, onToggle]);

  const handleOverride = useCallback(async (status: string) => {
    await fetch(`/api/events/${encodeURIComponent(evt.code)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrideStatus: status }),
    });
  }, [evt.code]);

  return (
    <div>
      <div
        onClick={handleToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: '24px 1.8fr 0.6fr 0.6fr 0.5fr 0.6fr 0.6fr 0.8fr 0.7fr',
          gap: 4,
          padding: '9px 16px',
          background: expanded || hovered ? T.bgHover : 'transparent',
          cursor: 'pointer',
          transition: 'background 0.1s',
          alignItems: 'center',
          borderBottom: expanded || isLast ? 'none' : `1px solid ${T.borderLight}`,
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: T.textFaint,
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          ›
        </span>

        {/* Event code + rep */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 3,
              height: 20,
              borderRadius: 2,
              background: rm.color ?? T.textFaint,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 12,
              fontWeight: 600,
              color: T.text,
              letterSpacing: -0.2,
            }}
          >
            {evt.code}
          </span>
          <span
            style={{
              fontFamily: T.sans,
              fontSize: 10,
              color: T.textDim,
              fontWeight: 500,
            }}
          >
            {evt.rep}
          </span>
        </div>

        {/* Live */}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 500,
            color: T.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {evt.live25}
        </span>

        {/* Paid */}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 500,
            color: evt.paid < 20 ? T.critical : T.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {evt.paid}
        </span>

        {/* SpEx */}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 500,
            color: evt.spex < 2 ? T.escalate : T.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {evt.spex}
        </span>

        {/* Weeks */}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 11,
            fontWeight: 500,
            color: T.textDim,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {evt.weeksOut > 0 ? `${evt.weeksOut}w` : evt.weeksOut === 0 ? 'Now' : '—'}
        </span>

        {/* Flags */}
        {evt.flagCount > 0 ? (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              fontWeight: 700,
              color:
                evt.flagCount >= 5
                  ? T.critical
                  : evt.flagCount >= 3
                  ? T.escalate
                  : T.watch,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {evt.flagCount}
          </span>
        ) : (
          <span
            style={{ fontFamily: T.mono, fontSize: 11, color: T.go, fontWeight: 500 }}
          >
            —
          </span>
        )}

        <StatusBadge rec={evt.rec} size="sm" />

        <span
          style={{
            fontFamily: T.sans,
            fontSize: 10,
            color: STATUS_MAP[evt.status] ?? T.textDim,
            fontWeight: 500,
          }}
        >
          {evt.status}
        </span>
      </div>

      {expanded && (
        <InlinePanel
          evt={evt}
          detail={detail}
          loading={loading}
          onOverride={handleOverride}
        />
      )}
    </div>
  );
}
