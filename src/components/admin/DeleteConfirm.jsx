export default function DeleteConfirm({ event, onConfirm, onCancel, loading }) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
      <div className="dialog">
        <h2 className="dialog__title">Delete event?</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--pp-purple)', marginBottom: '0.5rem' }}>
          <strong>{event.title}</strong>
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--pp-amethyst)' }}>
          {event.date} — {event.type}
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          This cannot be undone.
        </p>
        <div className="dialog__actions">
          <button className="admin-btn admin-btn--secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
