import api from './api';

export const programService = {
  list: (params = {}) => api.get('/programs', { params }),
  getById: (id) => api.get(`/programs/${id}`),
  create: (payload) => api.post('/programs', payload),
  update: (id, payload) => api.patch(`/programs/${id}`, payload),
  remove: (id) => api.delete(`/programs/${id}`),
  addCommittee: (programId, payload) => api.post(`/programs/${programId}/committee`, payload),
  removeCommittee: (programId, memberId) => api.delete(`/programs/${programId}/committee/${memberId}`),
  addIndicator: (programId, payload) => api.post(`/programs/${programId}/indicators`, payload),
  removeIndicator: (programId, indicatorId) => api.delete(`/programs/${programId}/indicators/${indicatorId}`),
};
