import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import CalendarPage from './pages/CalendarPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './components/admin/AdminLogin';
import { useEvents } from './hooks/useEvents';

export default function App() {
  const { events, loading, error, isStale, staleTimestamp, forceRefresh } = useEvents();

  return (
    <HashRouter>
      <Routes>
        {/* Public calendar — has the site header */}
        <Route path="/" element={
          <>
            <Header />
            <CalendarPage
              events={events}
              loading={loading}
              error={error}
              isStale={isStale}
              staleTimestamp={staleTimestamp}
            />
          </>
        } />

        {/* Admin login — no app header */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin panel — AdminLayout provides its own header */}
        <Route path="/admin" element={
          <AdminPage events={events} onDataChange={forceRefresh} />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
