import { api } from './api';

export const productsService = {
  async getProducts() {
    const response = await api.get('/products');
    return response.data || [];
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async updateProduct(id, data) {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
