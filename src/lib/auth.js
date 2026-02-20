const SESSION_KEY = 'mkd_admin_session';
// Password is injected at build time from VITE_ADMIN_PASSWORD env var.
// This is intentionally client-side only — suitable for an internal tool.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export function login(password) {
  if (!ADMIN_PASSWORD) {
    throw new Error('Admin password is not configured');
  }
  if (password !== ADMIN_PASSWORD) {
    throw new Error('Incorrect password');
  }
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function isAuthenticated() {
  return Boolean(sessionStorage.getItem(SESSION_KEY));
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
