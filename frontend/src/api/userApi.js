import api from './axios';

export const getMyProfile = () => api.get('/users/me');
export const getProfile = (userId) => api.get(`/users/${userId}`);
export const updateProfile = (data) => api.put('/users/me', data);
export const uploadProfilePicture = (formData) =>
  api.post('/users/me/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const uploadResume = (formData) =>
  api.post('/users/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const createProfile = (userId, fullName, email) =>
  api.post(`/users/internal/create?userId=${userId}&fullName=${encodeURIComponent(fullName)}&email=${email}`);