import { useState } from 'react';

const QUAL_TYPES = [
  'A-Level', 'AS-Level', 'GCSE', 'Advanced Extension Award', 'UK General Qualifications',
  'BTEC', 'BTEC Tech Award', 'BTEC National', 'BTEC Higher National', 'T-Level',
  'NVQ', 'Higher National Certificate', 'Vocational Qualifications',
  'International Qualifications', 'International A-Level', 'International AS-Level',
  'International GCSE', 'iPrimary', 'iLowerSecondary', 'PTE Academic',
  'BTEC International', 'International BTEC Level 2',
];

export default function RowEditor({ event, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    date: event?.date || '',
    title: event?.title || '',
    type: event?.type || '',
    series: event?.series || '',
    description: event?.description || '',
    url: event?.url || '',
  });
  const [error, setError] = useState('');

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.title) {
      setError('Date and title are required.');
      return;
    }
    setError('');
    onSave({ ...event, ...form });
  }

  const isEdit = Boolean(event?.id);

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit event' : 'Add event'}>
      <div className="dialog">
        <h2 className="dialog__title">{isEdit ? 'Edit event' : 'Add event'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ed-date">Date *</label>
                <input
                  id="ed-date"
                  type="date"
                  value={form.date}
                  onChange={e => update('date', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ed-series">Series</label>
                <input
                  id="ed-series"
                  type="text"
                  value={form.series}
                  onChange={e => update('series', e.target.value)}
                  placeholder="e.g. Jun 25"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ed-title">Title *</label>
              <input
                id="ed-title"
                type="text"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="Event title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ed-type">Qualification type</label>
              <select
                id="ed-type"
                value={form.type}
                onChange={e => update('type', e.target.value)}
              >
                <option value="">— Select type —</option>
                {QUAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ed-desc">Description</label>
              <textarea
                id="ed-desc"
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                placeholder="Optional description"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ed-url">URL</label>
              <input
                id="ed-url"
                type="url"
                value={form.url}
                onChange={e => update('url', e.target.value)}
                placeholder="https://…"
              />
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="dialog__actions">
              <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
