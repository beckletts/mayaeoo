import { useState, useMemo } from 'react';

const PAGE_SIZE = 25;

export default function DataTable({ events, onEdit, onDelete }) {
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  }

  const filtered = useMemo(() => {
    if (!events) return [];
    if (!search) return events;
    const q = search.toLowerCase();
    return events.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.type?.toLowerCase().includes(q) ||
      e.series?.toLowerCase().includes(q) ||
      e.date?.includes(q)
    );
  }, [events, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField] || '';
      const bv = b[sortField] || '';
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function SortIcon({ field }) {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}> ↕</span>;
    return <span>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>;
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Filter events…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            padding: '0.375rem 0.75rem',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            minWidth: '200px',
          }}
        />
        <span style={{ fontSize: '0.8125rem', color: 'var(--pp-amethyst)' }}>
          {filtered.length} events
        </span>
        <button className="admin-btn admin-btn--amber" onClick={() => onEdit(null)} style={{ marginLeft: 'auto' }}>
          + Add event
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {[
                { field: 'date', label: 'Date' },
                { field: 'title', label: 'Title' },
                { field: 'type', label: 'Type' },
                { field: 'series', label: 'Series' },
              ].map(col => (
                <th key={col.field} onClick={() => handleSort(col.field)}>
                  {col.label}<SortIcon field={col.field} />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((event, i) => (
              <tr key={event.id || i}>
                <td>{event.date}</td>
                <td title={event.title}>{event.title}</td>
                <td>{event.type}</td>
                <td>{event.series}</td>
                <td>
                  <div className="data-table-actions">
                    <button
                      className="admin-btn admin-btn--secondary"
                      style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}
                      onClick={() => onEdit(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}
                      onClick={() => onDelete(event)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--pp-amethyst)', padding: '2rem' }}>
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination__btn" onClick={() => setPage(0)} disabled={page === 0}>«</button>
          <button className="pagination__btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
            return (
              <button
                key={p}
                className={`pagination__btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </button>
            );
          })}
          <button className="pagination__btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>›</button>
          <button className="pagination__btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
          <span className="pagination__info">Page {page + 1} of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
