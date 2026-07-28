import api from './axiosConfig';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/profile/password', data),
  completeOAuthProfile: (data) => api.post('/auth/oauth2/complete-profile', data),
};

export const userManagementApi = {
  getAll: (params) => api.get('/admin/users', { params }),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  changeRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  toggleStatus: (id) => api.put(`/admin/users/${id}/status`),
  resetPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

export const adminDashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/admin/dashboard/recent-activity'),
};

export const roleManagementApi = {
  getAll: () => api.get('/admin/roles'),
  getUsersByRole: (role) => api.get(`/admin/roles/${role}/users`),
  updateRoleConfig: (role, data) => api.put(`/admin/roles/${role}`, data),
};

export const systemMonitorApi = {
  getHealth: () => api.get('/admin/system/health'),
};

export const auditLogApi = {
  getPage: (params) => api.get('/audit-logs/page', { params }),
};

export const equipmentApi = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  getQrCode: (id) => api.get(`/equipment/${id}/qr-code`, { responseType: 'blob' }),
  uploadImage: (id, formData) => api.post(`/equipment/${id}/image`, formData, {
    headers: { 'Content-Type': undefined },
  }),
  getUtilization: (id, params) => api.get(`/equipment/${id}/utilization`, { params }),
};

export const bookingApi = {
  getAll: () => api.get('/bookings'),
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getPendingApprovals: () => api.get('/bookings/pending'),
  approve: (id, data) => api.put(`/bookings/${id}/approve`, data),
  reject: (id, data) => api.put(`/bookings/${id}/reject`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  complete: (id) => api.put(`/bookings/${id}/complete`),
};

export const maintenanceApi = {
  createWorkOrder: (data) => api.post('/maintenance/work-orders', data),
  getWorkOrders: (params) => api.get('/maintenance/work-orders', { params }),
  updateStatus: (id, status) => api.put(`/maintenance/work-orders/${id}/status`, null, { params: { status } }),
  deleteWorkOrder: (id) => api.delete(`/maintenance/work-orders/${id}`),
  getCalibrationRecords: (equipmentId) => api.get(`/maintenance/calibration/${equipmentId}`),
  createCalibrationRecord: (data) => api.post('/maintenance/calibration', data),
  deleteCalibrationRecord: (id) => api.delete(`/maintenance/calibration/${id}`),
};

export const analyticsApi = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
};

export const institutionApi = {
  getAll: () => api.get('/institutions'),
  create: (data) => api.post('/institutions', data),
  update: (id, data) => api.put(`/institutions/${id}`, data),
  delete: (id) => api.delete(`/institutions/${id}`),
};

export const departmentApi = {
  getByInstitution: (institutionId) => api.get(`/departments`, { params: { institutionId } }),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const laboratoryApi = {
  getByDepartment: (departmentId) => api.get(`/laboratories`, { params: { departmentId } }),
  create: (data) => api.post('/laboratories', data),
  update: (id, data) => api.put(`/laboratories/${id}`, data),
  delete: (id) => api.delete(`/laboratories/${id}`),
};

export const reportApi = {
  generate: (data) => api.post('/reports/generate', data),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  getAll: () => api.get('/reports'),
};

export const invoiceApi = {
  getAll: (params) => api.get('/invoices', { params }),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  generateFromBooking: (bookingId) => api.post(`/invoices/generate-from-booking/${bookingId}`),
};

export const paymentApi = {
  getAll: (params) => api.get('/payments', { params }),
  record: (data) => api.post('/payments', data),
  getSummary: () => api.get('/payments/summary'),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const costApi = {
  getBreakdown: (data) => api.post('/costs/breakdown', data),
  getBreakdownByDepartment: (departmentId) => api.get(`/costs/breakdown/department/${departmentId}`),
  getBreakdownByInstitution: (institutionId) => api.get(`/costs/breakdown/institution/${institutionId}`),
  getMonthlyRevenue: (year) => api.get(`/costs/monthly-revenue/${year}`),
  getUtilization: (params) => api.get('/costs/utilization', { params }),
  getLifecycle: () => api.get('/costs/lifecycle'),
  getBudgetSummary: () => api.get('/costs/budget-summary'),
};

export const budgetApi = {
  getAll: (params) => api.get('/budgets', { params }),
  set: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const announcementApi = {
  getAll: () => api.get('/announcements'),
  getActive: (params) => api.get('/announcements/active', { params }),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  publish: (id) => api.put(`/announcements/${id}/publish`),
  unpublish: (id) => api.put(`/announcements/${id}/unpublish`),
};

export const sharingApi = {
  getAllSharedEquipment: () => api.get('/sharing/equipment'),
  shareEquipment: (data) => api.post('/sharing/equipment', data),
  updateSharedEquipment: (id, data) => api.put(`/sharing/equipment/${id}`, data),
  stopSharing: (id) => api.delete(`/sharing/equipment/${id}`),
  getAllPartnerships: () => api.get('/sharing/partnerships'),
  createPartnership: (data) => api.post('/sharing/partnerships', data),
  updatePartnership: (id, data) => api.put(`/sharing/partnerships/${id}`, data),
  deletePartnership: (id) => api.delete(`/sharing/partnerships/${id}`),
  getAllExternalBookings: () => api.get('/sharing/external-bookings'),
  createExternalBooking: (data) => api.post('/sharing/external-bookings', data),
  approveExternalBooking: (id) => api.put(`/sharing/external-bookings/${id}/approve`),
  rejectExternalBooking: (id) => api.put(`/sharing/external-bookings/${id}/reject`),
  getAnalytics: () => api.get('/sharing/analytics'),
};
