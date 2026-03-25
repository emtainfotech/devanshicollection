const BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:4000/api');

function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem('auth_token');
  else localStorage.setItem('auth_token', token);
}

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const msg = (data && typeof data === 'object' && 'error' in data) ? (data as any).error : `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  BASE,
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body || {}) }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: JSON.stringify(body || {}) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};

