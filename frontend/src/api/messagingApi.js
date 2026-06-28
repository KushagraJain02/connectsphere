import api from './axios';

export const sendMessage = (data) => api.post('/messages/send', data);
export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (conversationId, page = 0) =>
  api.get(`/messages/conversation/${conversationId}?page=${page}&size=20`);
export const markAsSeen = (messageId) => api.put(`/messages/${messageId}/seen`);