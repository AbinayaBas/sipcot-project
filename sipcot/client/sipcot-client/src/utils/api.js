import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const getMyActivity = (params) => API.get('/user/activity', { params });

// Industry
export const getMyIndustry = () => API.get('/industries/my');
export const registerIndustry = (data) => API.post('/industries', data);
export const updateMyIndustry = (data) => API.put('/industries/my', data);
export const getAllIndustries = (params) => API.get('/industries', { params });
export const getIndustryById = (id) => API.get(`/industries/${id}`);

// Data Records
export const anomaliesPreview = (data) => API.post('/data/anomalies-preview', data);
export const submitData = (data) => API.post('/data', data);
export const getMyData = () => API.get('/data/my');
export const updateData = (id, data) => API.put(`/data/${id}`, data);
export const deleteData = (id) => API.delete(`/data/${id}`);

// Admin
export const getAuditLogs = (params) => API.get('/admin/audit-logs', { params });
export const getTenderEligible = (params) => API.get('/admin/tender-eligible', { params });
export const getDashboardStats = () => API.get('/admin/dashboard');
export const getAllRecords = (params) => API.get('/admin/records', { params });
export const reviewRecord = (id, data) => API.put(`/admin/records/${id}/review`, data);
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const toggleUserActive = (id) => API.patch(`/admin/users/${id}/toggle-active`);
export const getAnnouncements = (params) => API.get('/admin/announcements', { params });
export const createAnnouncement = (data) => API.post('/admin/announcements', data);
export const toggleAnnouncement = (id) => API.patch(`/admin/announcements/${id}/toggle`);
export const deleteAnnouncement = (id) => API.delete(`/admin/announcements/${id}`);
export const getSchedule = (params) => API.get('/admin/schedule', { params });
export const createScheduleItem = (data) => API.post('/admin/schedule', data);
export const updateScheduleStatus = (id, eventStatus) =>
  API.patch(`/admin/schedule/${id}/status`, { eventStatus });
export const toggleScheduleItem = (id) => API.patch(`/admin/schedule/${id}/toggle`);
export const deleteScheduleItem = (id) => API.delete(`/admin/schedule/${id}`);

// Documents (Admin)
export const getDocuments = (params) => API.get('/documents', { params });
export const uploadDocument = (formData) =>
  API.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleDocument = (id) => API.patch(`/documents/${id}/toggle`);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const downloadDocumentUrl = (id) =>
  `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/documents/${id}/download`;

// Industry content (read-only)
export const getMyAnnouncements = (params) => API.get('/content/announcements', { params });
export const getMySchedule = (params) => API.get('/content/schedule', { params });
export const getMyDocuments = (params) => API.get('/content/documents', { params });
export const downloadMyDocumentUrl = (id) =>
  `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/documents/${id}/download`;

// Reports
export const exportExcel = (params) =>
  API.get('/reports/export/excel', { params, responseType: 'blob' });
export const exportSummaryExcel = (params) =>
  API.get('/reports/export/summary', { params, responseType: 'blob' });

export default API;
