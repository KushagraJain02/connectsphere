import api from './axios';

export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread/count');
export const getUnreadNotifications = () => api.get('/notifications/unread');
export const markAllAsRead = () => api.put('/notifications/read-all');
export const markOneAsRead = (id) => api.put(`/notifications/${id}/read`);