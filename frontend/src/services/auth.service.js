import { api } from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data?.token) {
      localStorage.setItem('stockflow_token', response.data.token);
      localStorage.setItem('stockflow_auth', 'true');
      localStorage.setItem('stockflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async verifyEmail(email, code) {
    const response = await api.post('/auth/verify-email', { email, code });
    if (response.success && response.data?.token) {
      localStorage.setItem('stockflow_token', response.data.token);
      localStorage.setItem('stockflow_auth', 'true');
      localStorage.setItem('stockflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async verify2FA(email, code) {
    const response = await api.post('/auth/verify-2fa', { email, code });
    if (response.success && response.data?.token) {
      localStorage.setItem('stockflow_token', response.data.token);
      localStorage.setItem('stockflow_auth', 'true');
      localStorage.setItem('stockflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/auth/profile', profileData);
    if (response.success && response.data?.user) {
      localStorage.setItem('stockflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async me() {
    const response = await api.get('/auth/me');
    if (response.success && response.data?.user) {
      localStorage.setItem('stockflow_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_auth');
    localStorage.removeItem('stockflow_user');
  }
};
