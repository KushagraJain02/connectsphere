import api from './axios';

export const getFeed = (page = 0) => api.get(`/posts/feed?page=${page}&size=10`);
export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getPost = (postId) => api.get(`/posts/${postId}`);
export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
export const toggleLike = (postId) => api.post(`/posts/${postId}/like`);
export const addComment = (postId, data) => api.post(`/posts/${postId}/comments`, data);
export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const deletePost = (postId) => api.delete(`/posts/${postId}`);