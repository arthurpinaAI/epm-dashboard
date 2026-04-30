'use client';

import { useState, useMemo } from 'react';
import { T, ZOHO_FIELDS, FIELD_TABLES, TYPE_ICONS, OPERATIONS, BLOCK_STYLE } from '@/lib/tokens';
import type { FormulaBlock, FormulaRow } from '@/types';

interface Props {
  formulas: FormulaRow[];
  onSave: (id: string, blocks: FormulaBlock[]) => Promise<void>;
  onAdd: () => Promise<void>;
}

function Block({ block }: { block: FormulaBlock }) {
  const s = BLOCK_STYLE[block.t] ?? BLOCK_STYLE.field;
  const isParen = block.t === 'paren';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isParen ? '2px 5px' : '4px 11px',
        borderRadius: isParen ? 4 : 7,
        background: s.bg,
        color: s.color,
        fontFamily:
          block.t === 'val' || block.t === 'math' || block.t === 'cmp' ? T.mono : T.sans,
        fontSize: isParen ? 15 : 12,
        fontWeight: 600,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
        cursor: 'default',
      }}
    >
      {block.t === 'ref' ? `⟨${block.v}⟩` : block.v}
    </span>
  );
}

const OP_CATS = ['aggregate', 'logic', 'math', 'compare', 'date'] as const;
const CAT_LABELS: Record<string, string> = {
  aggregate: 'Aggregate', logic: 'Logic', math: 'Math', compare: 'Compare', date: 'Date',
};

export function FormulaBuilder({ formulas, onSave, onAdd }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<Record<string, FormulaBlock[]>>({});
  const [fieldFilter, setFieldFilter] = useState('');
  const [fieldTable, setFieldTable] = useState('All');
  const [valInputs, setValInputs] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const getBlocks = (f: FormulaRow): FormulaBlock[] =>
    localBlocks[f.id] ?? (f.blocks as FormulaBlock[]);

  const addBlock = (fid: string, block: FormulaBlock) => {
    setLocalBlocks((prev) => ({
      ...prev,
      [fid]: [...(prev[fid] ?? (formulas.find((f) => f.id === fid)?.blocks as FormulaBlock[] ?? [])), block],
    }));
  };

  const popBlock = (fid: string) => {
    const cur = getBlocks(formulas.find((f) => f.id === fid)!);
    setLocalBlocks((prev) => ({ ...prev, [fid]: cur.slice(0, -1) }));
  };

  const clearBlocks = (fid: string) => {
    setLocalBlocks((prev) => ({ ...prev, [fid]: [] }));
  };

  const filteredFields = useMemo(() => {
    let f = [...ZOHO_FIELDS];
    if (fieldTable !== 'All') f = f.filter((x) => x.table === fieldTable);
    if (fieldFilter) {
      const s = fieldFilter.toLowerCase();
      f = f.filter((x) => x.label.toLowerCase().includes(s) || x.key.toLowerCase().includes(s));
    }
    return f;
  }, [fieldTable, fieldFilter]);

  return (
    <div>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: T.text }}>
            Calculated Metrics
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textDim, marginTop: 3, fontWeight: 500 }}>
            Build outputs from raw Zoho database fields + operations + conditions
          </div>
        </div>
        <button
          onClick={onAdd}
          style={{
            padding: '8px 18px',
            borderRadius: 10,
            background: T.accentBg,
            border: `1px solid ${T.accentBorder}`,
            color: T.accent,
            fontFamily: T.sans,
            fontSize: 12,
            fontWeight: 650,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = T.accent + '15'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = T.accentBg; }}
        >
          + New Metric
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {formulas.map((f) => {
          const isEdit = editId === f.id;
          const blocks = getBlocks(f);
          return (
            <div
              key={f.id}
              style={{
                background: isEdit ? T.bg : T.bgCard,
                border: `1px solid ${isEdit ? T.accent + '30' : T.border}`,
                borderRadius: 14,
                padding: '18px 22px',
                transition: 'all 0.25s',
                boxShadow: isEdit ? `0 0 0 3px ${T.accent}08` : 'none',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 10,
                        color: T.accent,
                        fontWeight: 600,
                        background: T.accentBg,
                        padding: '2px 8px',
                        borderRadius: 5,
                        border: `1px solid ${T.accentBorder}`,
                      }}
                    >
                      {f.id}
                    </span>
                    <span
                      style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.text }}
                    >
                      {f.name}
                    </span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 11,
                        color: T.textDim,
                        background: T.bgSubtle,
                        padding: '2px 8px',
                        borderRadius: 5,
                      }}
                    >
                      {f.outputKey}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: T.sans,
                      fontSize: 11,
                      color: T.textDim,
                      fontWeight: 500,
                    }}
                  >
                    {f.description}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (isEdit) {
                      await onSave(f.id, blocks);
                      flash('Saved');
                    }
                    setEditId(isEdit ? null : f.id);
                  }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 8,
                    background: isEdit ? T.accent + '12' : T.bgSubtle,
                    border: `1px solid ${isEdit ? T.accent + '25' : T.border}`,
                    color: isEdit ? T.accent : T.textMid,
                    fontFamily: T.sans,
                    fontSize: 11,
                    fontWeight: 650,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isEdit ? '✓ Done' : 'Edit'}
                </button>
              </div>

              {/* Formula expression */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 5,
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: T.bgInset,
                  borderRadius: 10,
                  border: `1px dashed ${isEdit ? T.accent + '25' : T.border}`,
                  minHeight: 44,
                }}
              >
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 12,
                    color: T.textDim,
                    marginRight: 6,
                    fontWeight: 600,
                  }}
                >
                  {f.outputKey} =
                </span>
                {blocks.length === 0 && (
                  <span
                    style={{
                      fontFamily: T.sans,
                      fontSize: 12,
                      color: T.textFaint,
                      fontStyle: 'italic',
                    }}
                  >
                    Drop fields and operations here…
                  </span>
                )}
                {blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </div>

              {/* Edit palette */}
              {isEdit && (
                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                  }}
                >
                  {/* LEFT: Zoho fields */}
                  <div
                    style={{
                      background: T.bgInset,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${T.border}`,
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
                      <div
                        style={{
                          fontFamily: T.sans,
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.text,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Zoho Database Fields
                      </div>
                      <span
                        style={{
                          fontFamily: T.sans,
                          fontSize: 10,
                          color: T.textFaint,
                          fontWeight: 500,
                        }}
                      >
                        {filteredFields.length} fields
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <input
                        placeholder="Filter fields…"
                        value={fieldFilter}
                        onChange={(e) => setFieldFilter(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: T.bgCard,
                          border: `1px solid ${T.border}`,
                          borderRadius: 7,
                          fontFamily: T.sans,
                          fontSize: 11,
                          color: T.text,
                          outline: 'none',
                        }}
                      />
                      <select
                        value={fieldTable}
                        onChange={(e) => setFieldTable(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          background: T.bgCard,
                          border: `1px solid ${T.border}`,
                          borderRadius: 7,
                          fontFamily: T.sans,
                          fontSize: 11,
                          color: T.text,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="All">All Tables</option>
                        {FIELD_TABLES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      style={{
                        maxHeight: 220,
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      {filteredFields.map((field) => (
                        <button
                          key={field.key}
                          onClick={() => {
                            addBlock(f.id, { t: 'field', v: field.key });
                            flash(`Added ${field.label}`);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '7px 10px',
                            background: T.bgCard,
                            border: `1px solid ${T.border}`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.12s',
                            textAlign: 'left',
                            width: '100%',
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = BLOCK_STYLE.field.color + '40';
                            el.style.background = BLOCK_STYLE.field.bg;
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = T.border;
                            el.style.background = T.bgCard;
                          }}
                        >
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              background: T.bgSubtle,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: T.mono,
                              fontSize: 10,
                              color: T.textDim,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {TYPE_ICONS[field.type] ?? '?'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: T.sans,
                                fontSize: 12,
                                fontWeight: 600,
                                color: T.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {field.label}
                            </div>
                            <div
                              style={{
                                fontFamily: T.mono,
                                fontSize: 9,
                                color: T.textFaint,
                              }}
                            >
                              {field.table}.{field.key}
                            </div>
                          </div>
                          <span style={{ fontSize: 14, color: T.textFaint }}>+</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Operations + actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {OP_CATS.map((cat) => {
                      const ops = OPERATIONS.filter((o) => o.cat === cat);
                      return (
                        <div
                          key={cat}
                          style={{
                            background: T.bgInset,
                            borderRadius: 10,
                            padding: '12px 14px',
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: T.sans,
                              fontSize: 9,
                              fontWeight: 700,
                              color: T.textDim,
                              textTransform: 'uppercase',
                              letterSpacing: 1.5,
                              marginBottom: 8,
                            }}
                          >
                            {CAT_LABELS[cat]}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {ops.map((op) => {
                              const bs = BLOCK_STYLE.op;
                              const blockType =
                                cat === 'math'
                                  ? 'math'
                                  : cat === 'compare'
                                  ? 'cmp'
                                  : cat === 'logic'
                                  ? 'logic'
                                  : 'op';
                              return (
                                <button
                                  key={op.key}
                                  onClick={() => {
                                    addBlock(f.id, { t: blockType as FormulaBlock['t'], v: op.label });
                                    flash('Added');
                                  }}
                                  title={'desc' in op ? op.desc : ''}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    background: bs.bg,
                                    color: bs.color,
                                    border: `1px solid ${bs.border}`,
                                    fontFamily: op.label.length <= 2 ? T.mono : T.sans,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s',
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = bs.color + '15';
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = bs.bg;
                                  }}
                                >
                                  {op.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Value input */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        placeholder="Enter value…"
                        value={valInputs[f.id] ?? ''}
                        onChange={(e) => setValInputs((p) => ({ ...p, [f.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && valInputs[f.id]?.trim()) {
                            addBlock(f.id, { t: 'val', v: valInputs[f.id].trim() });
                            setValInputs((p) => ({ ...p, [f.id]: '' }));
                            flash('Value added');
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: T.bgInset,
                          border: `1px solid ${T.border}`,
                          borderRadius: 8,
                          color: T.text,
                          fontFamily: T.sans,
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => {
                          const v = valInputs[f.id]?.trim();
                          if (v) {
                            addBlock(f.id, { t: 'val', v });
                            setValInputs((p) => ({ ...p, [f.id]: '' }));
                            flash('Value added');
                          }
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: BLOCK_STYLE.val.bg,
                          border: `1px solid ${BLOCK_STYLE.val.border}`,
                          color: BLOCK_STYLE.val.color,
                          fontFamily: T.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Value
                      </button>
                      {(['(', ')'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => addBlock(f.id, { t: 'paren', v: p })}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: T.bgSubtle,
                            border: `1px solid ${T.border}`,
                            color: T.textMid,
                            fontFamily: T.mono,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Undo / Clear */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { popBlock(f.id); flash('Removed'); }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 8,
                          background: T.criticalBg,
                          border: `1px solid ${T.critical}15`,
                          color: T.critical,
                          fontFamily: T.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ← Undo Last
                      </button>
                      <button
                        onClick={() => { clearBlocks(f.id); flash('Cleared'); }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 8,
                          background: T.bgSubtle,
                          border: `1px solid ${T.border}`,
                          color: T.textDim,
                          fontFamily: T.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
