import api from './axios';

export const sendRequest = (receiverId, receiverName) =>
  api.post(`/connections/request/${receiverId}?receiverName=${encodeURIComponent(receiverName)}`);
export const acceptRequest = (connectionId) => api.put(`/connections/${connectionId}/accept`);
export const rejectRequest = (connectionId) => api.put(`/connections/${connectionId}/reject`);
export const removeConnection = (connectionId) => api.delete(`/connections/${connectionId}`);
export const getMyConnections = () => api.get('/connections/my');
export const getPendingRequests = () => api.get('/connections/pending');
export const getSentRequests = () => api.get('/connections/sent');
export const getConnectionStatus = (targetUserId) => api.get(`/connections/status/${targetUserId}`);
export const getConnectionCount = (userId) => api.get(`/connections/count/${userId}`);