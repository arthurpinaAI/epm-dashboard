'use client';

import { useState, useMemo } from 'react';
import { T, REC_ORDER } from '@/lib/tokens';
import { EventRow } from './EventRow';
import type { EventSummary } from '@/types';

const REC_KEYS = ['ALL', 'CRITICAL', 'ESCALATE', 'WATCH', 'GO'] as const;
const REC_COLORS: Record<string, string> = {
  ALL: T.textMid,
  CRITICAL: T.critical,
  ESCALATE: T.escalate,
  WATCH: T.watch,
  GO: T.go,
};

interface Props {
  initialEvents: EventSummary[];
}

export function FleetView({ initialEvents }: Props) {
  const [search, setSearch] = useState('');
  const [filterRec, setFilterRec] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRep, setFilterRep] = useState('ALL');
  const [sortBy, setSortBy] = useState('severity');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reps = useMemo(
    () => Array.from(new Set(initialEvents.map((e) => e.rep))).sort(),
    [initialEvents],
  );

  const filtered = useMemo(() => {
    let list = [...initialEvents];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (e) => e.code.toLowerCase().includes(s) || e.rep.toLowerCase().includes(s),
      );
    }
    if (filterRec !== 'ALL') {
      list = list.filter(
        (e) => e.rec === filterRec || (filterRec === 'GO' && e.rec.startsWith('GO')),
      );
    }
    if (filterStatus !== 'ALL') list = list.filter((e) => e.status === filterStatus);
    if (filterRep !== 'ALL') list = list.filter((e) => e.rep === filterRep);

    list.sort((a, b) => {
      if (sortBy === 'severity') return REC_ORDER.indexOf(a.rec) - REC_ORDER.indexOf(b.rec);
      if (sortBy === 'flags') return b.flagCount - a.flagCount;
      if (sortBy === 'weeks') return a.weeksOut - b.weeksOut;
      if (sortBy === 'delegates') return b.paid - a.paid;
      return 0;
    });
    return list;
  }, [initialEvents, search, filterRec, filterStatus, filterRep, sortBy]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: initialEvents.length };
    initialEvents.forEach((e) => {
      const k = e.rec.startsWith('GO') ? 'GO' : e.rec;
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [initialEvents]);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const selectStyle = {
    padding: '7px 10px',
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    color: T.text,
    fontFamily: T.sans,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: 220 }}>
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke={T.textFaint}
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <circle cx={10.5} cy={10.5} r={7.5} />
            <line x1={21} y1={21} x2={15.8} y2={15.8} />
          </svg>
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              color: T.text,
              fontFamily: T.sans,
              fontSize: 12,
              fontWeight: 500,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
        </div>

        {/* Status filter */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          {['ALL', 'Going Ahead', 'Standby', 'Postponed', 'Cancelled'].map((o) => (
            <option key={o} value={o}>{o === 'ALL' ? 'Status: All' : o}</option>
          ))}
        </select>

        {/* Rep filter */}
        <select value={filterRep} onChange={(e) => setFilterRep(e.target.value)} style={selectStyle}>
          <option value="ALL">Rep: All</option>
          {reps.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
          <option value="severity">Severity</option>
          <option value="flags">Flags ↓</option>
          <option value="weeks">Weeks ↑</option>
          <option value="delegates">Delegates ↑</option>
        </select>

        {/* Rec pills */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {REC_KEYS.map((k) => {
            const active = filterRec === k;
            const color = REC_COLORS[k];
            const cnt = counts[k] ?? 0;
            return (
              <button
                key={k}
                onClick={() => setFilterRec(filterRec === k ? 'ALL' : k)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: T.mono,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  background: active ? color + '0c' : 'transparent',
                  color: active ? color : T.textFaint,
                  border: `1px solid ${active ? color + '25' : 'transparent'}`,
                  letterSpacing: 0.3,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {cnt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: T.bgCard,
          borderRadius: 10,
          boxShadow: T.shadow2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 1.8fr 0.6fr 0.6fr 0.5fr 0.6fr 0.6fr 0.8fr 0.7fr',
            gap: 4,
            padding: '10px 16px',
            borderBottom: `1px solid ${T.border}`,
            background: T.bgInset,
          }}
        >
          {['', 'Event', 'Live', 'Paid', 'SpEx', 'Weeks', 'Flags', 'Decision', 'Status'].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: T.sans,
                fontSize: 10,
                color: T.textDim,
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((evt, i) => (
          <EventRow
            key={evt.id}
            evt={evt}
            expanded={expandedId === evt.id}
            onToggle={() => toggleExpand(evt.id)}
            isLast={i === filtered.length - 1}
          />
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: T.textDim,
              fontFamily: T.sans,
              fontSize: 13,
            }}
          >
            No events match your filters
          </div>
        )}
      </div>

      {/* Count */}
      <div
        style={{
          marginTop: 10,
          fontFamily: T.sans,
          fontSize: 11,
          color: T.textFaint,
          fontWeight: 500,
        }}
      >
        {filtered.length} of {initialEvents.length} events
      </div>
    </div>
  );
}
