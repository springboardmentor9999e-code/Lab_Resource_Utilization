import api from './api';

export const platformService = {
  // Labs API Calls
  getLabs: async () => {
    const response = await api.get('/labs');
    return response.data;
  },
  createLab: async (labData) => {
    const response = await api.post('/labs', labData);
    return response.data;
  },
  updateLab: async (id, labData) => {
    const response = await api.put(`/labs/${id}`, labData);
    return response.data;
  },
  deleteLab: async (id) => {
    await api.delete(`/labs/${id}`);
  },

  // Equipment API Calls
  getEquipment: async (params) => {
    const response = await api.get('/equipment', { params });
    return response.data; // Paginated page response
  },
  getEquipmentById: async (id) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/equipment/categories');
    return response.data;
  },
  getManufacturers: async () => {
    const response = await api.get('/equipment/manufacturers');
    return response.data;
  },
  getTags: async () => {
    const response = await api.get('/equipment/tags');
    return response.data;
  },

  // Taxonomy management — category & tag curation (admin / department head)
  getCategoryStats: async () => {
    const response = await api.get('/equipment/categories/stats');
    return response.data;
  },
  renameCategory: async (from, to) => {
    const response = await api.put('/equipment/categories/rename', { from, to });
    return response.data;
  },
  deleteCategory: async (category, reassignTo) => {
    const response = await api.delete('/equipment/categories', {
      params: { category, reassignTo },
    });
    return response.data;
  },
  renameTag: async (from, to) => {
    const response = await api.put('/equipment/tags/rename', { from, to });
    return response.data;
  },
  deleteTag: async (tag) => {
    const response = await api.delete(`/equipment/tags/${encodeURIComponent(tag)}`);
    return response.data;
  },
  createEquipment: async (eqData) => {
    const response = await api.post('/equipment', eqData);
    return response.data;
  },
  updateEquipment: async (id, eqData) => {
    const response = await api.put(`/equipment/${id}`, eqData);
    return response.data;
  },
  deleteEquipment: async (id) => {
    await api.delete(`/equipment/${id}`);
  },
  changeEquipmentStatus: async (id, status) => {
    const response = await api.patch(`/equipment/${id}/status`, null, { params: { status } });
    return response.data;
  },

  // Equipment Images
  uploadEquipmentImage: async (id, file, primary = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/equipment/${id}/upload-image`, formData, {
      params: { primary },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteEquipmentImage: async (id, imageId) => {
    await api.delete(`/equipment/${id}/images/${imageId}`);
  },
  setPrimaryEquipmentImage: async (id, imageId) => {
    const response = await api.patch(`/equipment/${id}/images/${imageId}/primary`);
    return response.data;
  },

  // Equipment Documents
  uploadEquipmentDocument: async (id, file, documentType, title) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/equipment/${id}/upload-document`, formData, {
      params: { documentType, title },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteEquipmentDocument: async (id, documentId) => {
    await api.delete(`/equipment/${id}/documents/${documentId}`);
  },

  // Booking API Calls
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, null, { params: { status } });
    return response.data;
  },

  // Dashboard Stats Call
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  }
};

// Base URL for uploaded files (images/documents) served by the backend —
// derived from the API base URL by stripping the /api suffix
export const FILE_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');

export const fileUrl = (relativePath) =>
  relativePath ? `${FILE_BASE_URL}${relativePath}` : null;
