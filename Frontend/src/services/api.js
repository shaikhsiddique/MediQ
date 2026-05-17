import { API_BASE } from '../config';

const BASE = API_BASE;

function getToken() {
  return localStorage.getItem('token');
}

function headers(auth = true, json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (auth) h['Authorization'] = `Bearer ${getToken()}`;
  return h;
}

async function req(method, path, body, auth = true) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(auth),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function uploadReq(path, formData) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Upload failed');
  }
  return data;
}

export const authAPI = {
  registerPatient: (body) => req('POST', '/auth/register/patient', body, false),
  registerDoctor: (body) => req('POST', '/auth/register/doctor', body, false),
  loginPatient: (body) => req('POST', '/auth/login/patient', body, false),
  loginDoctor: (body) => req('POST', '/auth/login/doctor', body, false),
  me: () => req('GET', '/auth/me'),
};

export const patientAPI = {
  getProfile: () => req('GET', '/patients/profile'),
  updateProfile: (b) => req('PUT', '/patients/profile', b),
  getRiskProgression: () => req('GET', '/patients/risk-progression'),
  refreshSummary: () => req('POST', '/patients/refresh-summary'),
  lookupDoctor: (email) =>
    req('GET', `/patients/doctors/lookup?email=${encodeURIComponent(email)}`),
  linkDoctor: (body) => req('POST', '/patients/link-doctor', body),
  unlinkDoctor: () => req('DELETE', '/patients/link-doctor'),
};

export const doctorAPI = {
  getProfile: () => req('GET', '/doctors/profile'),
  getPatients: () => req('GET', '/doctors/patients'),
  lookupPatient: (email) =>
    req('GET', `/doctors/patients/lookup?email=${encodeURIComponent(email)}`),
  linkPatientByEmail: (patientEmail) =>
    req('POST', '/doctors/patients/link', { patientEmail }),
  assignPatient: (id) => req('POST', `/doctors/patients/${id}`),
  getPatient: (id) => req('GET', `/doctors/patients/${id}`),
  getPatientRiskProgression: (id) =>
    req('GET', `/doctors/patients/${id}/risk-progression`),
  removePatient: (id) => req('DELETE', `/doctors/patients/${id}`),
};

export const healthAPI = {
  create: (b) => req('POST', '/health-records', b),
  getAll: () => req('GET', '/health-records'),
  getById: (id) => req('GET', `/health-records/${id}`),
  update: (id, b) => req('PUT', `/health-records/${id}`, b),
  delete: (id) => req('DELETE', `/health-records/${id}`),
  forPatient: (id) => req('GET', `/health-records/patient/${id}`),
};

export const monitorAPI = {
  getStatus: () => req('GET', '/monitor/status'),
  start: () => req('POST', '/monitor/start'),
  stop: () => req('POST', '/monitor/stop'),
  checkNow: () => req('POST', '/monitor/check'),
};

export const reportAPI = {
  create: (b, file = null) => {
    if (file) {
      const fd = new FormData();
      fd.append('data', JSON.stringify(b));
      fd.append('file', file);
      return uploadReq('/reports', fd);
    }
    return req('POST', '/reports', b);
  },
  submitKidsBuddy: (b) => req('POST', '/reports/kids-buddy', b),
  uploadAndAnalyze: (file, notes = '') => {
    const fd = new FormData();
    fd.append('file', file);
    if (notes) fd.append('notes', notes);
    return uploadReq('/reports/upload', fd);
  },
  getAll: () => req('GET', '/reports'),
  getById: (id) => req('GET', `/reports/${id}`),
  update: (id, b) => req('PUT', `/reports/${id}`, b),
  delete: (id) => req('DELETE', `/reports/${id}`),
  forPatient: (id) => req('GET', `/reports/patient/${id}`),
};
