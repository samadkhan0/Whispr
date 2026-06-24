import axios from 'axios';

// All API calls go through this one file
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach the login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

// ── Secrets ─────────────────────────────────────────────────
export const getSecrets    = (page = 1) => api.get(`/secrets?page=${page}`);
export const postSecret    = (text)     => api.post('/secrets', { text });
export const reactSecret   = (id, emoji)=> api.post(`/secrets/${id}/react`, { emoji });
export const deleteSecret  = (id)       => api.delete(`/secrets/${id}`);

// ── Tells ────────────────────────────────────────────────────
export const sendTell   = (username, text) => api.post(`/tells/${username}`, { text });
export const getInbox   = ()               => api.get('/tells/inbox');
export const markRead   = (id)             => api.patch(`/tells/${id}/read`);
export const deleteTell = (id)             => api.delete(`/tells/${id}`);

export default api;
