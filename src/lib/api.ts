// Default to localhost:8081 for backend during development when VITE_API_URL is not provided
const rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';
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

export async function getCompanies(recruiterId?: string) {
  const q = recruiterId ? `?recruiter_id=${encodeURIComponent(recruiterId)}` : '';
  return request(`/companies${q}`);
}

export async function updateCompany(id: string, payload: any) {
  if (!id) throw new Error('updateCompany called without id');
  return request(`/companies/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function createCompany(payload: any) {
  return request('/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function uploadResume(formData: FormData) {
  return request('/resumes/upload', { method: 'POST', body: formData, unwrap: true });
}

// Student profiles
export async function getStudentProfiles(userId?: string) {
  const q = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return request(`/student_profiles${q}`);
}

// Job postings
export async function getJobPostings(companyId?: string) {
  const q = companyId ? `?company_id=${encodeURIComponent(companyId)}` : '';
  return request(`/job_postings${q}`);
}

export async function createJobPosting(payload: any) {
  return request('/job_postings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function updateJobPosting(id: string, payload: any) {
  if (!id) throw new Error('updateJobPosting called without id');
  return request(`/job_postings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function deleteJobPosting(id: string) {
  if (!id) throw new Error('deleteJobPosting called without id');
  return request(`/job_postings/${id}`, { method: 'DELETE' });
}

// Applications
export async function getApplications(opts?: { studentId?: string; companyId?: string }) {
  const qParts: string[] = [];
  if (opts?.studentId) qParts.push(`student_id=${encodeURIComponent(opts.studentId)}`);
  if (opts?.companyId) qParts.push(`company_id=${encodeURIComponent(opts.companyId)}`);
  const q = qParts.length ? `?${qParts.join('&')}` : '';
  return request(`/applications${q}`);
}

export async function updateApplicationStatus(id: string, patch: any) {
  if (!id) throw new Error('updateApplicationStatus called without id');
  return request(`/applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
}

export async function createInterview(payload: any) {
  return request('/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function createStudentProfile(payload: any) {
  return request('/student_profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function updateStudentProfile(id: string, payload: any) {
  if (!id) throw new Error('updateStudentProfile called without id');
  return request(`/student_profiles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

// Applications
export async function createApplication(payload: any) {
  return request('/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

// Resumes
export async function getResumes(studentId?: string) {
  const q = studentId ? `?student_id=${encodeURIComponent(studentId)}` : '';
  return request(`/resumes${q}`);
}

export async function updateResume(id: string, payload: any) {
  if (!id) throw new Error('updateResume called without id');
  return request(`/resumes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function deleteResume(id: string) {
  if (!id) throw new Error('deleteResume called without id');
  return request(`/resumes/${id}`, { method: 'DELETE' });
}

export default { request, API_BASE, getCompanies, updateCompany, uploadResume };
