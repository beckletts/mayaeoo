import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../lib/auth';
import { postToGAS } from '../../lib/api';
import BulkImportPanel from './BulkImportPanel';
import DataTable from './DataTable';
import RowEditor from './RowEditor';
import DeleteConfirm from './DeleteConfirm';

export default function AdminLayout({ events, onDataChange }) {
  const [tab, setTab] = useState('manage');
  const [editingEvent, setEditingEvent] = useState(undefined); // undefined = closed, null = new
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleSave(event) {
    setActionLoading(true);
    try {
      await postToGAS({ action: 'upsertRow', row: event });
      onDataChange();
      setEditingEvent(undefined);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(event) {
    setActionLoading(true);
    try {
      await postToGAS({ action: 'deleteRow', rowId: event.id });
      onDataChange();
      setDeletingEvent(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="admin-header__inner">
          <span className="admin-header__title">Admin — Pearson Key Dates</span>
          <div className="admin-header__actions">
            <button className="admin-btn admin-btn--secondary" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'manage' ? 'active' : ''}`}
          onClick={() => setTab('manage')}
        >
          Manage Events
        </button>
        <button
          className={`admin-tab ${tab === 'import' ? 'active' : ''}`}
          onClick={() => setTab('import')}
        >
          Bulk Import
        </button>
      </div>

      <div className="admin-content">
        {tab === 'manage' && (
          <DataTable
            events={events || []}
            onEdit={setEditingEvent}
            onDelete={setDeletingEvent}
          />
        )}
        {tab === 'import' && (
          <BulkImportPanel onImportComplete={onDataChange} />
        )}
      </div>

      {editingEvent !== undefined && (
        <RowEditor
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => setEditingEvent(undefined)}
          loading={actionLoading}
        />
      )}

      {deletingEvent && (
        <DeleteConfirm
          event={deletingEvent}
          onConfirm={() => handleDelete(deletingEvent)}
          onCancel={() => setDeletingEvent(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
