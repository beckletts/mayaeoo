import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../lib/auth';
import './Admin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      login(password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      setPassword('');
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-box">
        <h1 className="admin-login-title">Admin Access</h1>
        <p className="admin-login-subtitle">Pearson Key Dates Calendar</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn admin-btn--primary">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
