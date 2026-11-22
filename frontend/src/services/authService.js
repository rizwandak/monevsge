import api from './api';

export const authService = {
  loginByName: (fullName) => api.post('/auth/login-name', { full_name: fullName }),
  getMe: () => api.get('/auth/me'),
  getAssignments: () => api.get('/auth/assignments'),
  selectRole: (role, assignmentId) =>
    api.post('/auth/select-role', { role, assignment_id: assignmentId }),
  logout: () => api.post('/auth/logout'),
};
