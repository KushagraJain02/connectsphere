import api from './axios';

export const getAllJobs = (page = 0) => api.get(`/jobs?page=${page}&size=10`);
export const searchJobs = (keyword, page = 0) =>
  api.get(`/jobs/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
export const getJob = (jobId) => api.get(`/jobs/${jobId}`);
export const createJob = (data) => api.post('/jobs', data);
export const applyForJob = (jobId, data) => api.post(`/jobs/${jobId}/apply`, data);
export const getMyApplications = () => api.get('/jobs/my/applications');
export const getMyPostedJobs = () => api.get('/jobs/my/posted');
export const getJobApplicants = (jobId) => api.get(`/jobs/${jobId}/applicants`);
export const updateApplicationStatus = (applicationId, status) =>
  api.put(`/jobs/applications/${applicationId}/status?status=${status}`);
export const closeJob = (jobId) => api.put(`/jobs/${jobId}/close`);
export const deleteJob = (jobId) => api.delete(`/jobs/${jobId}`);