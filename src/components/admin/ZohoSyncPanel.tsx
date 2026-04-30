'use client';

import { useState, useEffect, useCallback } from 'react';
import { T } from '@/lib/tokens';
import type { SyncStatusInfo, SyncLogRow } from '@/types';

const SEV: Record<string, string> = {
  success: '#22c55e',
  error:   '#ef4444',
  running: '#f59e0b',
};

function fmt(ms: number | null) {
  if (ms == null) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function fmtDate(d: Date | string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

export function ZohoSyncPanel() {
  const [info, setInfo]         = useState<SyncStatusInfo | null>(null);
  const [running, setRunning]   = useState(false);
  const [lastResult, setResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/sync');
    if (res.ok) setInfo(await res.json());
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  async function trigger(mode: 'incremental' | 'full') {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode }),
      });
      const data = await res.json() as { recordsSynced?: number; durationMs?: number; error?: string };
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(`Done — ${data.recordsSynced} records in ${fmt(data.durationMs ?? null)}`);
        await load();
      }
    } catch (e) {
      setResult(`Network error: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  const btn = (label: string, mode: 'incremental' | 'full', accent = false) => (
    <button
      onClick={() => trigger(mode)}
      disabled={running}
      style={{
        padding:       '9px 20px',
        background:    accent ? T.accent : T.bgInset,
        border:        `1px solid ${accent ? T.accent : T.border}`,
        borderRadius:  8,
        color:         accent ? '#fff' : T.text,
        fontFamily:    T.sans,
        fontSize:      13,
        fontWeight:    650,
        cursor:        running ? 'not-allowed' : 'pointer',
        opacity:       running ? 0.6 : 1,
        transition:    'opacity 0.15s',
      }}
    >
      {running ? '⏳ Syncing…' : label}
    </button>
  );

  return (
    <div>
      {/* Status bar */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ padding: '16px 20px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 12, minWidth: 160 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Last Sync</div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text }}>{info?.lastSyncTime ?? '—'}</div>
        </div>
        <div style={{ padding: '16px 20px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 12, minWidth: 140 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Raw Records</div>
          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.text, fontWeight: 700 }}>{info?.rawCount?.toLocaleString() ?? '—'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 'auto' }}>
          {btn('▶ Incremental Sync', 'incremental', true)}
          {btn('↺ Full Rebuild', 'full')}
        </div>
      </div>

      {lastResult && (
        <div style={{ padding: '10px 16px', marginBottom: 20, background: lastResult.startsWith('Error') ? '#fef2f2' : '#f0fdf4', border: `1px solid ${lastResult.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`, borderRadius: 8, fontFamily: T.mono, fontSize: 12, color: lastResult.startsWith('Error') ? T.critical : '#166534' }}>
          {lastResult}
        </div>
      )}

      {/* Env var checklist */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Required Environment Variables</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['ZOHO_CLIENT_ID','ZOHO_CLIENT_SECRET','ZOHO_REFRESH_TOKEN','ZOHO_DC','CREATOR_OWNER','CREATOR_APP'].map(v => (
            <span key={v} style={{ padding: '4px 10px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 6, fontFamily: T.mono, fontSize: 11, color: T.textDim }}>
              {v}
            </span>
          ))}
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 11, color: T.textFaint, marginTop: 8 }}>
          Set these in Vercel → Project → Settings → Environment Variables. Cron runs every 15 min automatically.
        </p>
      </div>

      {/* Sync log table */}
      <h4 style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Recent Sync Runs</h4>
      {!info || info.logs.length === 0 ? (
        <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textDim }}>No sync runs yet.</p>
      ) : (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.bgInset }}>
                {['Started','Mode','Status','Records','Duration','Error'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.4, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {info.logs.map((log: SyncLogRow, i: number) => (
                <tr key={log.id} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : 'none', background: i % 2 === 1 ? T.bgInset : 'transparent' }}>
                  <td style={{ padding: '10px 14px', fontFamily: T.mono, fontSize: 12, color: T.textDim }}>{fmtDate(log.startedAt)}</td>
                  <td style={{ padding: '10px 14px', fontFamily: T.sans, fontSize: 12, color: T.text, textTransform: 'capitalize' }}>{log.syncType}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', background: `${SEV[log.status] ?? T.border}22`, border: `1px solid ${SEV[log.status] ?? T.border}44`, borderRadius: 6, fontFamily: T.mono, fontSize: 11, color: SEV[log.status] ?? T.text, fontWeight: 600, textTransform: 'capitalize' }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: T.mono, fontSize: 12, color: T.text }}>{log.recordsSynced.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontFamily: T.mono, fontSize: 12, color: T.textDim }}>{fmt(log.durationMs)}</td>
                  <td style={{ padding: '10px 14px', fontFamily: T.mono, fontSize: 11, color: T.critical, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.error ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
