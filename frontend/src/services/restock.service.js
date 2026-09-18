import { api } from './api';

export const restockService = {
  getRestockOrders: async () => {
    const res = await api.get('/restock');
    return res.data;
  },

  createRestockOrder: async (orderData) => {
    const res = await api.post('/restock', orderData);
    return res.data;
  },

  approveRestockOrder: async (id) => {
    const res = await api.post(`/restock/${id}/approve`);
    return res.data;
  },

  receiveRestockOrder: async (id) => {
    const res = await api.post(`/restock/${id}/receive`);
    return res.data;
  },

  cancelRestockOrder: async (id) => {
    const res = await api.post(`/restock/${id}/cancel`);
    return res.data;
  }
};
