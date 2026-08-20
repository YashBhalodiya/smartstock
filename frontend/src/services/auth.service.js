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
    if (response.success && response.data?.token) {
      localStorage.setItem('stockflow_token', response.data.token);
      localStorage.setItem('stockflow_auth', 'true');
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
