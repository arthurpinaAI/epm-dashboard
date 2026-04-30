'use client';

import { useState, useCallback } from 'react';
import { T, SEV_MAP } from '@/lib/tokens';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { FormulaBuilder } from './FormulaBuilder';
import { ZohoSyncPanel } from './ZohoSyncPanel';
import type { RuleRow, FormulaRow, TierRow, DropdownRow, FormulaBlock } from '@/types';

interface Props {
  initialRules: RuleRow[];
  initialFormulas: FormulaRow[];
  initialTiers: TierRow[];
  initialDropdowns: DropdownRow[];
}

const TABS = [
  { id: 'formulas', label: 'Formula Builder', icon: '∑' },
  { id: 'rules', label: 'Red Flag Rules', icon: '⚑' },
  { id: 'tiers', label: 'Decision Tiers', icon: '◆' },
  { id: 'dropdowns', label: 'Dropdowns', icon: '▤' },
  { id: 'sync', label: 'Zoho Sync', icon: '⇄' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const inp = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  padding: '8px 12px',
  background: T.bgInset,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.text,
  fontFamily: T.mono,
  fontSize: 13,
  width: 68,
  textAlign: 'center',
  outline: 'none',
  ...extra,
});

export function AdminPanel({ initialRules, initialFormulas, initialTiers, initialDropdowns }: Props) {
  const [tab, setTab] = useState<TabId>('formulas');
  const [rules, setRules] = useState(initialRules);
  const [formulas, setFormulas] = useState(initialFormulas);
  const [tiers, setTiers] = useState(initialTiers);
  const [dropdowns, setDropdowns] = useState(initialDropdowns);
  const [toast, setToast] = useState<string | null>(null);
  const [newVals, setNewVals] = useState<Record<string, string>>({});

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  // ─── Rules ───
  const patchRule = useCallback(async (id: string, patch: Partial<RuleRow>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await fetch(`/api/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    flash('Updated');
  }, []);

  // ─── Formulas ───
  const saveFormula = useCallback(async (id: string, blocks: FormulaBlock[]) => {
    setFormulas((prev) => prev.map((f) => (f.id === id ? { ...f, blocks } : f)));
    await fetch(`/api/formulas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
  }, []);

  const addFormula = useCallback(async () => {
    const res = await fetch('/api/formulas', { method: 'POST' });
    if (res.ok) {
      const f = await res.json();
      setFormulas((prev) => [...prev, { ...f, blocks: [] }]);
      flash('Formula added');
    }
  }, []);

  // ─── Tiers ───
  const patchTier = useCallback(async (level: string, flagCount: number) => {
    const updated = tiers.map((t) => (t.level === level ? { ...t, flagCount } : t));
    setTiers(updated);
    await fetch('/api/admin/tiers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    flash('Updated');
  }, [tiers]);

  // ─── Dropdowns ───
  const addDropdown = useCallback(async (category: string) => {
    const val = (newVals[category] ?? '').trim();
    if (!val) return;
    const finalVal = category === 'rep_code' ? val.toUpperCase() : val;
    const res = await fetch('/api/admin/dropdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, value: finalVal }),
    });
    if (res.ok) {
      const opt = await res.json();
      setDropdowns((prev) => [...prev, opt]);
      setNewVals((p) => ({ ...p, [category]: '' }));
      flash('Added');
    }
  }, [newVals]);

  const removeDropdown = useCallback(async (id: number) => {
    await fetch(`/api/admin/dropdowns/${id}`, { method: 'DELETE' });
    setDropdowns((prev) => prev.filter((d) => d.id !== id));
    flash('Removed');
  }, []);

  const tabBtn = (t: (typeof TABS)[number]) => (
    <button
      key={t.id}
      onClick={() => setTab(t.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 20px',
        borderRadius: '12px 12px 0 0',
        fontFamily: T.sans,
        fontSize: 12,
        fontWeight: 600,
        background: tab === t.id ? T.bgCard : 'transparent',
        color: tab === t.id ? T.text : T.textDim,
        border: `1px solid ${tab === t.id ? T.border : 'transparent'}`,
        borderBottom: tab === t.id ? `1px solid ${T.bgCard}` : `1px solid ${T.border}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: -1,
        position: 'relative',
        zIndex: tab === t.id ? 2 : 1,
      }}
    >
      <span style={{ fontSize: 13, opacity: 0.7 }}>{t.icon}</span>
      {t.label}
    </button>
  );

  const statusDropdowns = dropdowns.filter((d) => d.category === 'event_status');
  const repDropdowns    = dropdowns.filter((d) => d.category === 'rep_code');

  return (
    <div style={{ padding: '0 36px 40px' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 68,
            right: 36,
            background: T.go,
            color: '#fff',
            padding: '9px 20px',
            borderRadius: 10,
            fontFamily: T.sans,
            fontWeight: 700,
            fontSize: 12,
            zIndex: 200,
            boxShadow: T.shadow2,
          }}
        >
          {toast}
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: 10 }}>
        <h2
          style={{
            fontFamily: T.sans,
            fontSize: 20,
            fontWeight: 800,
            color: T.text,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          Rules Engine
        </h2>
        <p
          style={{
            fontFamily: T.sans,
            fontSize: 13,
            color: T.textDim,
            margin: '4px 0 0',
            fontWeight: 500,
          }}
        >
          Build formulas from raw database fields, configure thresholds, manage dropdowns.
        </p>
      </div>

      {/* Tab row */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 0 }}>
        {TABS.map(tabBtn)}
      </div>

      {/* Panel */}
      <div
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: '0 12px 12px 12px',
          padding: 28,
          boxShadow: T.shadow1,
        }}
      >
        {/* ═══ FORMULA BUILDER ═══ */}
        {tab === 'formulas' && (
          <FormulaBuilder formulas={formulas} onSave={saveFormula} onAdd={addFormula} />
        )}

        {/* ═══ RULES ═══ */}
        {tab === 'rules' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 1.2fr 80px 80px 90px 46px',
                gap: 10,
                padding: '0 0 10px',
                borderBottom: `1px solid ${T.border}`,
                marginBottom: 6,
              }}
            >
              {['', 'Rule', 'Description', 'Threshold', 'Gate', 'Severity', ''].map((h, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: T.sans,
                    fontSize: 9,
                    color: T.textFaint,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {rules.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 1.2fr 80px 80px 90px 46px',
                  gap: 10,
                  padding: '12px 0',
                  borderBottom: `1px solid ${T.borderLight}`,
                  alignItems: 'center',
                  opacity: r.isActive ? 1 : 0.35,
                  transition: 'opacity 0.25s',
                }}
              >
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: SEV_MAP[r.severity] ?? T.textFaint,
                    fontWeight: 700,
                  }}
                >
                  {r.id.replace('RF0', '')}
                </span>
                <span
                  style={{
                    fontFamily: T.sans,
                    fontSize: 13,
                    fontWeight: 650,
                    color: T.text,
                  }}
                >
                  {r.name}
                </span>
                <span
                  style={{
                    fontFamily: T.sans,
                    fontSize: 11,
                    color: T.textDim,
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  {r.description}
                </span>

                {r.thresholdValue !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input
                      type="number"
                      value={r.thresholdValue ?? ''}
                      onChange={(e) =>
                        patchRule(r.id, { thresholdValue: Number(e.target.value) })
                      }
                      style={inp()}
                    />
                    {r.isPercent && (
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textDim }}>
                        %
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ color: T.textFaint, fontSize: 11 }}>—</span>
                )}

                {r.gateWeeks !== null ? (
                  <input
                    type="number"
                    value={r.gateWeeks ?? ''}
                    onChange={(e) => patchRule(r.id, { gateWeeks: Number(e.target.value) })}
                    style={inp()}
                  />
                ) : (
                  <span style={{ color: T.textFaint, fontSize: 11 }}>—</span>
                )}

                <select
                  value={r.severity}
                  onChange={(e) => patchRule(r.id, { severity: e.target.value })}
                  style={{
                    ...inp({ width: 84, fontFamily: T.sans, textAlign: 'left', cursor: 'pointer' }),
                    color: SEV_MAP[r.severity] ?? T.text,
                  }}
                >
                  {['critical', 'high', 'medium', 'low'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <ToggleSwitch
                  on={r.isActive}
                  onChange={() => patchRule(r.id, { isActive: !r.isActive })}
                />
              </div>
            ))}
          </div>
        )}

        {/* ═══ TIERS ═══ */}
        {tab === 'tiers' && (
          <div>
            <p
              style={{
                fontFamily: T.sans,
                fontSize: 13,
                color: T.textDim,
                fontWeight: 500,
                marginBottom: 24,
              }}
            >
              Configure how many red flags trigger each recommendation tier:
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                maxWidth: 560,
              }}
            >
              {[
                { k: 'watch', l: 'WATCH', c: T.watch, d: 'Monitor weekly' },
                { k: 'escalate', l: 'ESCALATE', c: T.escalate, d: 'Management call 48hrs' },
                { k: 'critical', l: 'CRITICAL', c: T.critical, d: 'Recommend postpone/kill' },
              ].map((t) => {
                const tier = tiers.find((x) => x.level === t.k);
                return (
                  <div
                    key={t.k}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      background: T.bgInset,
                      borderRadius: 12,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: t.c,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: T.sans,
                        fontWeight: 700,
                        fontSize: 13,
                        color: t.c,
                        minWidth: 80,
                      }}
                    >
                      {t.l}
                    </span>
                    <span
                      style={{
                        fontFamily: T.sans,
                        fontSize: 12,
                        color: T.textDim,
                        flex: 1,
                        fontWeight: 500,
                      }}
                    >
                      {t.d}
                    </span>
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim }}>
                      ≥
                    </span>
                    <input
                      type="number"
                      value={tier?.flagCount ?? 1}
                      min={1}
                      onChange={(e) => patchTier(t.k, Number(e.target.value))}
                      style={inp({ width: 50 })}
                    />
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim }}>
                      flags
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Benchmarks */}
            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontFamily: T.sans,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    margin: 0,
                    letterSpacing: -0.2,
                  }}
                >
                  Benchmarks
                </h3>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}
              >
                {[
                  ['Payment Benchmark', 'Minimum paid delegates for "safe"', 30],
                  ['Break-Even Delegates', 'Minimum for event viability', 40],
                ].map(([l, d, v]) => (
                  <div
                    key={l as string}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: T.bgInset,
                      borderRadius: 12,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: T.sans,
                          fontWeight: 650,
                          fontSize: 13,
                          color: T.text,
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontFamily: T.sans,
                          fontSize: 11,
                          color: T.textDim,
                          marginTop: 2,
                          fontWeight: 500,
                        }}
                      >
                        {d}
                      </div>
                    </div>
                    <input
                      type="number"
                      defaultValue={v as number}
                      onChange={() => flash('Updated')}
                      style={inp({ width: 54 })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ DROPDOWNS ═══ */}
        {tab === 'dropdowns' && (
          <div>
            {[
              {
                title: 'Event Statuses',
                category: 'event_status',
                items: statusDropdowns,
                mono: false,
              },
              {
                title: 'Market Rep Codes',
                category: 'rep_code',
                items: repDropdowns,
                mono: true,
              },
            ].map((g) => (
              <div key={g.title} style={{ marginBottom: 28 }}>
                <h4
                  style={{
                    fontFamily: T.sans,
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.text,
                    marginBottom: 12,
                  }}
                >
                  {g.title}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  {g.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '7px 14px',
                        background: T.bgInset,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = T.borderHover;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = T.border;
                      }}
                    >
                      <span
                        style={{
                          fontFamily: g.mono ? T.mono : T.sans,
                          fontSize: 13,
                          color: T.text,
                          fontWeight: g.mono ? 600 : 500,
                        }}
                      >
                        {item.value}
                      </span>
                      <button
                        onClick={() => removeDropdown(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: T.textFaint,
                          cursor: 'pointer',
                          fontSize: 15,
                          padding: '0 2px',
                          lineHeight: 1,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = T.critical;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = T.textFaint;
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder={`Add ${g.title.toLowerCase()}…`}
                    value={newVals[g.category] ?? ''}
                    onChange={(e) =>
                      setNewVals((p) => ({ ...p, [g.category]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addDropdown(g.category);
                    }}
                    style={inp({
                      width: 200,
                      textAlign: 'left',
                      fontFamily: g.mono ? T.mono : T.sans,
                      fontSize: 12,
                    })}
                  />
                  <button
                    onClick={() => addDropdown(g.category)}
                    style={{
                      padding: '8px 18px',
                      background: T.accentBg,
                      border: `1px solid ${T.accentBorder}`,
                      borderRadius: 8,
                      color: T.accent,
                      fontFamily: T.sans,
                      fontSize: 12,
                      fontWeight: 650,
                      cursor: 'pointer',
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ ZOHO SYNC ═══ */}
        {tab === 'sync' && <ZohoSyncPanel />}
      </div>
    </div>
  );
}
