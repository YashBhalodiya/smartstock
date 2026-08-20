import { api } from './api';

export const salesService = {
  async getSales() {
    const response = await api.get('/sales');
    return response.data || [];
  },

  async createSale(saleData) {
    const response = await api.post('/sales', saleData);
    return response.data;
  }
};
