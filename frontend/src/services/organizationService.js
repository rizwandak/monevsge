import api from './api';

export const organizationService = {
  getDirectorates: () => api.get('/organization/directorates'),
  getMinistries: (directorateId) =>
    api.get('/organization/ministries', { params: directorateId ? { directorate_id: directorateId } : {} }),
  getMinistryById: (id) => api.get(`/organization/ministries/${id}`),
};
