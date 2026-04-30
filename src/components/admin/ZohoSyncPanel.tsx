'use client';

import { useState, useEffect, useCallback } from 'react';
import { T } from '@/lib/tokens';
import type { SyncStatusInfo, SyncLogRow } from '@/types';

const SEV: Record<string, string> = {
  success: '#22c55e',
  error:   '#ef4444',
  timeout: '#ef4444',
  running: '#f59e0b',
};

function fmt(ms: number | null) {
  if (ms == null) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function fmtDate(d: Date | string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

const INGEST_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/ingest`
  : '/api/ingest';

export function ZohoSyncPanel() {
  const [info, setInfo]   = useState<SyncStatusInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/sync');
    if (res.ok) setInfo(await res.json());
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const code = (text: string, key: string) => (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <pre style={{ margin: 0, padding: '10px 44px 10px 14px', background: '#0f172a', color: '#e2e8f0', borderRadius: 8, fontFamily: T.mono, fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{text}</pre>
      <button
        onClick={() => copy(text, key)}
        style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', background: copied === key ? '#22c55e' : '#334155', border: 'none', borderRadius: 5, color: '#fff', fontFamily: T.sans, fontSize: 11, cursor: 'pointer', transition: 'background 0.2s' }}
      >
        {copied === key ? '✓' : 'Copy'}
      </button>
    </div>
  );

  const gasSnippet = `// ─── Add to your GAS script ───────────────────────────────────
const EPM_INGEST_URL = '${INGEST_URL}';

function pushToEPM_(headers, rows) {
  const apiKey = PropertiesService.getScriptProperties()
                   .getProperty('EPM_API_KEY');
  if (!apiKey) { Logger.log('EPM_API_KEY not set in Script Properties'); return; }

  const records = rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });

  const CHUNK = 500;
  let total = 0;
  for (let i = 0; i < records.length; i += CHUNK) {
    const res = UrlFetchApp.fetch(EPM_INGEST_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ records: records.slice(i, i + CHUNK) }),
      headers: { Authorization: 'Bearer ' + apiKey },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() < 300) {
      total += JSON.parse(res.getContentText()).upserted || 0;
    } else {
      Logger.log('EPM ingest error: ' + res.getContentText());
    }
  }
  Logger.log('EPM: pushed ' + total + ' records to database');
}

// ─── In runSmartSync(), after fetchCreatorCsvRaw_() returns, add: ───
// pushToEPM_(csvHeaders, csvRows);

// ─── In pullCreatorReportFresh(), after each sheet write, add: ───
// pushToEPM_(masterHeaders, buffer);`;

  return (
    <div>
      {/* Status bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ padding: '16px 20px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 12, minWidth: 160 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Last Sync</div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text }}>{info?.lastSyncTime ?? '—'}</div>
        </div>
        <div style={{ padding: '16px 20px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 12, minWidth: 140 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.textDim, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Raw Records</div>
          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.text, fontWeight: 700 }}>{info?.rawCount?.toLocaleString() ?? '—'}</div>
        </div>
      </div>

      {/* Setup instructions */}
      <div style={{ padding: '20px 24px', background: T.bgInset, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 24 }}>
        <h4 style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
          How it works
        </h4>
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T.textDim, margin: '0 0 20px', lineHeight: 1.6 }}>
          Your Google Apps Script already fetches from Zoho perfectly. Add ~20 lines to push each batch to this endpoint — no Zoho credentials needed in Vercel.
        </p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Step 1 — Set INGEST_API_KEY in Vercel env vars
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: T.textDim, margin: '0 0 6px' }}>
            Generate any random secret (e.g. <code style={{ fontFamily: T.mono, background: '#0f172a22', padding: '1px 4px', borderRadius: 3 }}>openssl rand -hex 32</code>) and add it as <strong>INGEST_API_KEY</strong> in Vercel → Project → Settings → Environment Variables.
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Step 2 — Set EPM_API_KEY in GAS Script Properties
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: T.textDim, margin: '0 0 6px' }}>
            In your GAS editor → Project Settings → Script Properties → add <strong>EPM_API_KEY</strong> with the same secret.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Step 3 — Add this to your GAS script
          </div>
          {code(gasSnippet, 'gas')}
          <p style={{ fontFamily: T.sans, fontSize: 11, color: T.textFaint, margin: '4px 0 0' }}>
            Call <code style={{ fontFamily: T.mono }}>pushToEPM_(csvHeaders, csvRows)</code> in <code style={{ fontFamily: T.mono }}>runSmartSync()</code> and <code style={{ fontFamily: T.mono }}>pullCreatorReportFresh()</code> after each fetch batch. The GAS handles all Zoho auth — this endpoint just receives and stores the records.
          </p>
        </div>
      </div>

      {/* Ingest endpoint */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Ingest Endpoint</div>
        {code(`POST ${INGEST_URL}\nAuthorization: Bearer <INGEST_API_KEY>\nContent-Type: application/json\n\n{ "records": [{ "Record ID": "...", "Modified_Time": "...", ...allFields }] }`, 'url')}
      </div>

      {/* Sync log table */}
      <h4 style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Recent Sync Runs</h4>
      {!info || info.logs.length === 0 ? (
        <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textDim }}>No sync runs yet — configure your GAS to start pushing data.</p>
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
