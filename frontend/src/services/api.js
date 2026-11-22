import axios from 'axios';
import { supabase } from '../utils/supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const profileId = localStorage.getItem('profile_id');
  if (profileId) {
    config.headers['x-profile-id'] = profileId;
  }
  const activeRole = localStorage.getItem('active_role');
  if (activeRole) {
    config.headers['x-active-role'] = activeRole;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan';
    return Promise.reject({ ...error, message });
  }
);

export default api;
