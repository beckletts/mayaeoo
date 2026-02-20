const GAS_URL = import.meta.env.VITE_GAS_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

export async function fetchEvents() {
  if (!GAS_URL) throw new Error('VITE_GAS_URL is not configured');
  const response = await fetch(GAS_URL);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.json();
}

export async function postToGAS(payload) {
  if (!GAS_URL) throw new Error('VITE_GAS_URL is not configured');
  const response = await fetch(GAS_URL, {
    method: 'POST',
    // GAS CORS requires text/plain — body is still valid JSON
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ ...payload, secret: ADMIN_SECRET }),
  });
  if (!response.ok) throw new Error(`POST failed: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}
