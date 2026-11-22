import api from './api';

export const evaluationService = {
  listPrograms: () => api.get('/evaluations/programs'),
  getProgramEvaluation: (programId) => api.get(`/evaluations/programs/${programId}`),
  saveDraft: (programId, payload) => api.post(`/evaluations/programs/${programId}/draft`, payload),
  submitEvaluation: (programId, evaluationType) =>
    api.post(`/evaluations/programs/${programId}/submit`, { evaluation_type: evaluationType }),
  reviewEvaluation: (programId, payload) => api.post(`/evaluations/programs/${programId}/review`, payload),
};
