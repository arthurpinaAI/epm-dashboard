'use client';

import { useState } from 'react';
import { T, REC_MAP, SEV_MAP, STATUS_MAP } from '@/lib/tokens';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { VelChart } from '@/components/ui/VelChart';
import type { EventDetail, EventSummary } from '@/types';

interface Props {
  evt: EventSummary;
  detail: EventDetail | null;
  loading: boolean;
  onOverride: (status: string) => void;
}

function Ring({ pct, color, sz = 36, sw = 3 }: { pct: number; color: string; sz?: number; sw?: number }) {
  const r = (sz - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={T.border} strokeWidth={sw} />
      <circle
        cx={sz / 2}
        cy={sz / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

const TABS = [
  { id: 'kpi', label: 'KPIs' },
  { id: 'velocity', label: 'Velocity' },
  { id: 'speakers', label: 'Speakers' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'flags', label: 'Flags' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function InlinePanel({ evt, detail, loading, onOverride }: Props) {
  const [tab, setTab] = useState<TabId>('kpi');
  const [override, setOverride] = useState(evt.status);

  const rm = REC_MAP[evt.rec] ?? {};
  const pct = evt.expected > 0 ? Math.round((evt.live25 / evt.expected) * 100) : 0;
  const yoy = evt.live24 > 0 ? Math.round(((evt.live25 - evt.live24) / evt.live24) * 100) : 0;

  const tabBtn = (t: { id: TabId; label: string }) => (
    <button
      key={t.id}
      onClick={() => setTab(t.id)}
      style={{
        padding: '5px 12px',
        fontFamily: T.sans,
        fontSize: 10,
        fontWeight: 600,
        background: tab === t.id ? T.bgCard : 'transparent',
        border: 'none',
        borderRadius: 4,
        color: tab === t.id ? T.text : T.textDim,
        cursor: 'pointer',
        transition: 'all 0.12s',
        boxShadow: tab === t.id ? T.shadow1 : 'none',
      }}
    >
      {t.id === 'flags' ? `Flags ${evt.flagCount}` : t.label}
    </button>
  );

  return (
    <div
      style={{
        background: T.bgInset,
        padding: '14px 20px 16px 44px',
        borderBottom: `1px solid ${T.border}`,
        animation: 'fadeSlide 0.2s ease forwards',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge rec={evt.rec} />
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim }}>
            {[evt.rep, evt.weeksOut > 0 ? `${evt.weeksOut}w out` : 'Past', `Bench: ${evt.bench}`].join(' · ')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: T.sans, fontSize: 10, color: T.textDim, fontWeight: 500 }}>
            Override
          </span>
          <select
            value={override}
            onChange={(e) => {
              setOverride(e.target.value);
              onOverride(e.target.value);
            }}
            style={{
              padding: '4px 8px',
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: 5,
              color: STATUS_MAP[override] ?? T.text,
              fontFamily: T.sans,
              fontWeight: 600,
              fontSize: 11,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {['Going Ahead', 'Standby', 'Postponed', 'Postpone', 'Cancelled'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          marginBottom: 12,
          background: T.bgSubtle,
          padding: 3,
          borderRadius: 6,
          width: 'fit-content',
        }}
      >
        {TABS.map(tabBtn)}
      </div>

      {loading && (
        <div
          style={{
            padding: '20px 0',
            fontFamily: T.sans,
            fontSize: 12,
            color: T.textFaint,
            fontStyle: 'italic',
          }}
        >
          Loading…
        </div>
      )}

      {!loading && tab === 'kpi' && (
        <div>
          {/* Live + ring + KPI strip */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Ring pct={pct} color={pct >= 80 ? T.go : pct >= 40 ? T.watch : T.critical} />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: T.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  {pct}%
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: 22,
                    fontWeight: 700,
                    color: T.text,
                    letterSpacing: -0.5,
                  }}
                >
                  {evt.live25}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 10, color: T.textDim }}>
                  of {evt.expected} target
                </div>
              </div>
            </div>
            {/* KPI row */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                flex: 1,
                background: T.bgCard,
                borderRadius: 8,
                boxShadow: T.shadow1,
                overflow: 'hidden',
              }}
            >
              {([
                ['Paid', evt.paid, evt.paid < 20 ? T.critical : null],
                ['Free', evt.free, null],
                ['Pending', evt.pending, evt.pending > 10 ? T.watch : null],
                ['Cancelled', evt.cancelled, evt.cancelled > 5 ? T.escalate : null],
                ['YoY', `${yoy > 0 ? '+' : ''}${yoy}%`, yoy < 0 ? T.escalate : T.go],
                ['Proj 33%', evt.proj33, null],
              ] as [string, number | string, string | null][]).map(([l, v, w], i) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRight: i < 5 ? `1px solid ${T.borderLight}` : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: T.sans,
                      fontSize: 9,
                      color: T.textDim,
                      fontWeight: 500,
                      marginBottom: 3,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: 16,
                      fontWeight: 700,
                      color: w ?? T.text,
                      letterSpacing: -0.3,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SpEx + YoY row */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              background: T.bgCard,
              borderRadius: 8,
              boxShadow: T.shadow1,
              overflow: 'hidden',
            }}
          >
            {([
              ['SpEx', evt.spex, evt.spex < 2 ? T.escalate : null],
              ['PLT', evt.plt, null],
              ['GLD', evt.gld, null],
              ['SLV', evt.slv, null],
              ['2025', evt.live25, T.accent],
              ['2024', evt.live24, T.textMid],
              ['Final 24', evt.final24, T.textDim],
              ['YoY %', `${yoy > 0 ? '+' : ''}${yoy}%`, yoy >= 0 ? T.go : T.critical],
            ] as [string, number | string, string | null][]).map(([l, v, w], i) => (
              <div
                key={l}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRight: i < 7 ? `1px solid ${T.borderLight}` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: T.sans,
                    fontSize: 9,
                    color: T.textDim,
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: w ?? T.text,
                    letterSpacing: -0.3,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'velocity' && detail && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <VelChart data={detail.bookings} label="Bookings" />
          <VelChart data={detail.payments} label="Payments" />
        </div>
      )}

      {!loading && tab === 'velocity' && !detail && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <VelChart data={{ today: 0, yesterday: 0, d7: 0, d14: 0, d21: 0 }} label="Bookings" />
          <VelChart data={{ today: 0, yesterday: 0, d7: 0, d14: 0, d21: 0 }} label="Payments" />
        </div>
      )}

      {!loading && tab === 'speakers' && detail && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            background: T.bgCard,
            borderRadius: 8,
            boxShadow: T.shadow1,
            overflow: 'hidden',
          }}
        >
          {([
            ['Booked', detail.speakers.booked, null],
            ['Paid', detail.speakers.paid, null],
            ['Free', detail.speakers.free, null],
            ['Confirmed', detail.speakers.confirmed, null],
            ['Shortage', detail.speakers.shortage, detail.speakers.shortage > 0 ? T.escalate : null],
            ['Standby', detail.speakers.standby, null],
            ['Grading', detail.speakers.grading, null],
            ['Proposals', detail.speakers.proposals, null],
            ['Interested', detail.speakers.interested, null],
          ] as [string, number, string | null][]).map(([l, v, w], i) => (
            <div
              key={l}
              style={{
                flex: 1,
                padding: '10px 10px',
                borderRight: i < 8 ? `1px solid ${T.borderLight}` : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: T.sans,
                  fontSize: 9,
                  color: T.textDim,
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: w ?? T.text,
                  letterSpacing: -0.3,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'marketing' && detail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              gap: 0,
              background: T.bgCard,
              borderRadius: 8,
              boxShadow: T.shadow1,
              overflow: 'hidden',
            }}
          >
            {([
              ['Total', detail.marketing.all, null],
              ['SPF', detail.marketing.spf, null],
              ['7d', detail.marketing.d7, detail.marketing.d7 === 0 ? T.watch : null],
              ['14d', detail.marketing.d14, null],
              ['21d', detail.marketing.d21, null],
            ] as [string, number, string | null][]).map(([l, v, w], i) => (
              <div
                key={l}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRight: i < 4 ? `1px solid ${T.borderLight}` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: T.sans,
                    fontSize: 9,
                    color: T.textDim,
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    color: w ?? T.text,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 0,
              background: T.bgCard,
              borderRadius: 8,
              boxShadow: T.shadow1,
              overflow: 'hidden',
            }}
          >
            {([
              ['TM Called', detail.tm.called],
              ['LHF 0', detail.tm.lhf0],
              ['Blue Ticket', detail.tm.blue],
              ['Agenda View', detail.tm.agenda],
            ] as [string, number][]).map(([l, v], i) => (
              <div
                key={l}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRight: i < 3 ? `1px solid ${T.borderLight}` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: T.sans,
                    fontSize: 9,
                    color: T.textDim,
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  {l}
                </div>
                <div
                  style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.text }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'flags' && (
        evt.flagCount === 0 ? (
          <div
            style={{
              padding: 16,
              textAlign: 'center',
              color: T.go,
              fontFamily: T.sans,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✓ No active red flags
          </div>
        ) : (
          detail ? (
            <div
              style={{
                background: T.bgCard,
                borderRadius: 8,
                boxShadow: T.shadow1,
                overflow: 'hidden',
              }}
            >
              {detail.flags.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3px 24px 1fr 90px 90px',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderBottom: i < detail.flags.length - 1 ? `1px solid ${T.borderLight}` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 20,
                      borderRadius: 2,
                      background: SEV_MAP[f.sev] ?? T.textFaint,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      color: SEV_MAP[f.sev] ?? T.textFaint,
                      fontWeight: 700,
                    }}
                  >
                    {f.id.replace('RF0', '')}
                  </span>
                  <div>
                    <span
                      style={{
                        fontFamily: T.sans,
                        fontSize: 11,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {f.name}
                    </span>
                    <span
                      style={{
                        fontFamily: T.sans,
                        fontSize: 10,
                        color: T.textDim,
                        marginLeft: 6,
                      }}
                    >
                      {f.sev}
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: T.sans,
                        fontSize: 8,
                        color: T.textFaint,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      THRESHOLD
                    </div>
                    <div
                      style={{ fontFamily: T.mono, fontSize: 11, color: T.textMid }}
                    >
                      {f.thresh}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: T.sans,
                        fontSize: 8,
                        color: T.textFaint,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      ACTUAL
                    </div>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: 11,
                        color: SEV_MAP[f.sev] ?? T.textFaint,
                        fontWeight: 600,
                      }}
                    >
                      {f.cur}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: T.textFaint, fontFamily: T.sans, fontSize: 12 }}>
              Loading flags…
            </div>
          )
        )
      )}
    </div>
  );
}
