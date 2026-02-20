import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminPage({ events, onDataChange }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated()) return null;

  return <AdminLayout events={events} onDataChange={onDataChange} />;
}
