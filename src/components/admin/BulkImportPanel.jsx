import { useState } from 'react';
import { parsePaste } from '../../lib/parseTSV';
import { postToGAS } from '../../lib/api';

export default function BulkImportPanel({ onImportComplete }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');
  const [mode, setMode] = useState('replace'); // 'replace' | 'append'
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function handleParse() {
    setParseError('');
    setParsed(null);
    setStatus('');
    try {
      const rows = parsePaste(text);
      if (rows.length === 0) {
        setParseError('No valid rows found. Check your format: date, title, type, series, description, url');
        return;
      }
      setParsed(rows);
    } catch (err) {
      setParseError(err.message);
    }
  }

  async function handleImport() {
    if (!parsed || parsed.length === 0) return;
    setLoading(true);
    setStatus('');
    try {
      const action = mode === 'replace' ? 'bulkReplace' : 'bulkAppend';
      await postToGAS({ action, rows: parsed });
      setStatus(`Successfully ${mode === 'replace' ? 'replaced all data with' : 'appended'} ${parsed.length} events.`);
      setText('');
      setParsed(null);
      onImportComplete();
    } catch (err) {
      setStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--pp-purple)', marginBottom: '0.5rem' }}>
        Bulk Import
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--pp-amethyst)', marginBottom: '1rem' }}>
        Paste tab-separated or comma-separated data. Expected columns: <code>date, title, type, series, description, url</code>
      </p>

      <textarea
        className="bulk-import__textarea"
        value={text}
        onChange={e => { setText(e.target.value); setParsed(null); setStatus(''); }}
        placeholder="Paste TSV or CSV here…"
        spellCheck={false}
      />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="admin-btn admin-btn--secondary" onClick={handleParse} disabled={!text.trim()}>
          Preview ({text.trim() ? text.trim().split('\n').length : 0} rows)
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
          <input type="radio" name="mode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} />
          Replace all
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
          <input type="radio" name="mode" value="append" checked={mode === 'append'} onChange={() => setMode('append')} />
          Append
        </label>
      </div>

      {parseError && <p className="admin-error" style={{ marginTop: '0.75rem' }}>{parseError}</p>}

      {parsed && (
        <div className="bulk-preview">
          <p className="bulk-preview__count">{parsed.length} events parsed — preview (first 10):</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="bulk-preview-table">
              <thead>
                <tr>
                  <th>Date</th><th>Title</th><th>Type</th><th>Series</th><th>Description</th><th>URL</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.title}</td>
                    <td>{row.type}</td>
                    <td>{row.series}</td>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</td>
                    <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bulk-import__actions">
            {mode === 'replace' && (
              <p style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500 }}>
                ⚠ Replace will delete ALL existing events and replace with {parsed.length} new rows.
              </p>
            )}
            <button
              className={`admin-btn ${mode === 'replace' ? 'admin-btn--danger' : 'admin-btn--primary'}`}
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? 'Importing…' : `${mode === 'replace' ? 'Replace all' : 'Append'} (${parsed.length} events)`}
            </button>
          </div>
        </div>
      )}

      {status && (
        <p
          className={status.startsWith('Error') ? 'admin-error' : 'admin-success'}
          style={{ marginTop: '1rem' }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
