import api from './api';

export const userService = {
  // ---- Self-service profile ----
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.post('/users/me/change-password', data);
    return response.data;
  },

  // ---- Admin: user & role management ----
  getAllUsers: async (search = '', role = '') => {
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await api.get('/users', { params });
    return response.data;
  },
  updateUserRoles: async (userId, roles) => {
    const response = await api.put(`/users/${userId}/roles`, { roles });
    return response.data;
  },
  setUserActive: async (userId, active) => {
    const response = await api.patch(`/users/${userId}/active`, null, {
      params: { active },
    });
    return response.data;
  },
};

export default userService;
