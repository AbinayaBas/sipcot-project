import React, { useMemo, useState } from 'react';
import { exportExcel, exportSummaryExcel } from '../utils/api';

const PARKS = [
  'Hosur I',
  'Hosur II',
  'Perundurai',
  'Oragadam',
  'Sriperumbudur',
  'Ranipet',
  'Gummidipoondi',
  'Irrungattukottai',
  'Cuddalore',
  'Tuticorin',
  'Other',
];

const EXPORT_HISTORY_KEY = 'sipcot_export_history';

function formatLastExport(iso) {
  if (!iso) return 'Not yet';
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    const datePart = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} ${timePart}`;
  } catch {
    return 'Not yet';
  }
}

function recordExportKind(kind) {
  try {
    const prev = JSON.parse(localStorage.getItem(EXPORT_HISTORY_KEY) || '{}');
    prev[kind] = new Date().toISOString();
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(prev));
  } catch {
    /* ignore */
  }
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function ExportReport() {
  const [year, setYear] = useState('');
  const [park, setPark] = useState('');
  const [loadingKind, setLoadingKind] = useState(null);
  const [msg, setMsg] = useState(null);
  const [historyTick, setHistoryTick] = useState(0);

  const exportParams = useMemo(() => {
    const p = {};
    if (year) p.year = year;
    if (park) p.park = park;
    return p;
  }, [year, park]);

  const history = useMemo(() => {
    historyTick;
    try {
      return JSON.parse(localStorage.getItem(EXPORT_HISTORY_KEY) || '{}');
    } catch {
      return {};
    }
  }, [historyTick]);

  const runExport = async (kind) => {
    setLoadingKind(kind);
    setMsg(null);
    try {
      const res =
        kind === 'detail' ? await exportExcel(exportParams) : await exportSummaryExcel(exportParams);
      const blob = res.data;
      const today = new Date().toISOString().split('T')[0];
      const yPart = year || 'AllYears';
      const pPart = (park || 'AllParks').replace(/\s+/g, '_');
      const fn =
        kind === 'detail'
          ? `SIPCOT_Approved_Data_${yPart}_${pPart}_${today}.xlsx`
          : `SIPCOT_Summary_${yPart}_${pPart}_${today}.xlsx`;
      downloadBlob(blob, fn);
      recordExportKind(kind === 'detail' ? 'detail' : 'summary');
      setHistoryTick((t) => t + 1);
      setMsg({
        type: 'success',
        text:
          kind === 'detail'
            ? 'Approved data spreadsheet downloaded.'
            : 'Summary report downloaded.',
      });
    } catch {
      setMsg({ type: 'error', text: 'Export failed. Ensure the server is running and try again.' });
    } finally {
      setLoadingKind(null);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Export Report</h1>
        <p style={{ maxWidth: 720 }}>
          Download approved industry data in a structured Excel format for reporting and analysis.
        </p>
      </div>

      {msg ? <div className={`alert alert-${msg.type}`}>{msg.text}</div> : null}

      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ marginBottom: 10, fontSize: '1.02rem', fontFamily: 'var(--font-head)' }}>
            Excel data export
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.75 }}>
            This module allows administrators to export all approved industry data records. The exported file can be
            used for analysis, reporting, and official documentation.
          </p>
          <ul style={{ marginTop: 14, paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.95 }}>
            <li>Industry name, type, and industrial park</li>
            <li>Year and reporting period (quarter / annual)</li>
            <li>Investment and turnover details</li>
            <li>Employment statistics (total workforce and categories)</li>
            <li>Water and power consumption</li>
            <li>CSR activities and contributions</li>
            <li>Environmental compliance indicators</li>
          </ul>
        </div>

        <div
          style={{
            marginBottom: 20,
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
            Export scope
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" htmlFor="export-year">
                Year
              </label>
              <select
                id="export-year"
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">All years</option>
                {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" htmlFor="export-park">
                Industrial park
              </label>
              <select id="export-park" className="form-select" value={park} onChange={(e) => setPark(e.target.value)}>
                <option value="">All parks</option>
                {PARKS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Leave as &quot;All&quot; to include every matching <strong style={{ color: 'var(--text)' }}>approved</strong>{' '}
            record, or narrow by year and/or park for selective reporting.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => runExport('detail')}
            disabled={loadingKind !== null}
            style={{ fontSize: '0.92rem', padding: '12px 22px' }}
          >
            {loadingKind === 'detail' ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, verticalAlign: 'middle' }} />{' '}
                Generating…
              </>
            ) : (
              'Download Approved Data (Excel)'
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => runExport('summary')}
            disabled={loadingKind !== null}
            style={{ fontSize: '0.92rem', padding: '12px 22px' }}
          >
            {loadingKind === 'summary' ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, verticalAlign: 'middle' }} />{' '}
                Generating…
              </>
            ) : (
              'Export Summary Report'
            )}
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          Only approved records are included in the export.
        </p>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
          }}
        >
          <div>
            <strong style={{ color: 'var(--text)' }}>Last export — Approved data:</strong>{' '}
            {formatLastExport(history.detail)}
          </div>
          <div style={{ marginTop: 4 }}>
            <strong style={{ color: 'var(--text)' }}>Last export — Summary report:</strong>{' '}
            {formatLastExport(history.summary)}
          </div>
        </div>
      </div>
    </div>
  );
}
