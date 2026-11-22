import api from './api';

export const kpiService = {
  getConfiguration: () => api.get('/kpi/configuration'),
  getResults: () => api.get('/kpi/results'),
  submitDirector: (ministryId, payload) => api.post(`/kpi/director-review/${ministryId}`, payload),
  submitKd: (ministryId, payload) => api.post(`/kpi/kd-assess/${ministryId}`, payload),
  calculate: (ministryId) => api.post(`/kpi/calculate/${ministryId}`),
  getLeaderboard: () => api.get('/leaderboard'),
};
