const rawBase = import.meta.env.VITE_API_URL || '';
export const API_BASE = rawBase.endsWith('/api') ? rawBase : rawBase.replace(/\/$/, '') + '/api';

interface RequestOptions extends RequestInit {
  unwrap?: boolean;
}

async function request(path: string, opts: RequestOptions = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    // unwrap common { data: ... } envelope used by some backends
    if (opts.unwrap !== false && json && typeof json === 'object' && 'data' in json) {
      return json.data;
    }
    return json;
  }
  return res.text();
}

export async function getCompanies() {
  return request('/companies');
}

export async function updateCompany(id: string, payload: any) {
  if (!id) throw new Error('updateCompany called without id');
  return request(`/companies/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function uploadResume(formData: FormData) {
  return request('/resumes/upload', { method: 'POST', body: formData, unwrap: true });
}

export default { request, API_BASE, getCompanies, updateCompany, uploadResume };
