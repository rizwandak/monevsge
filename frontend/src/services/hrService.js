import api from './api';

export const hrService = {
  getTemplate: (type, ministryId) =>
    api.get(`/hr/templates/${type}`, { params: ministryId ? { ministry_id: ministryId } : {} }),
  listEvaluations: () => api.get('/hr/evaluations'),
  saveDraft: (payload) => api.post('/hr/evaluations/draft', payload),
  submit: (id) => api.post(`/hr/evaluations/${id}/submit`),
};
