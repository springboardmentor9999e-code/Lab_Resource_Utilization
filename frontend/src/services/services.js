import api from './api';

export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  registerInstitution: (data) => api.post('/api/auth/register-institution', data),
  me: () => api.get('/api/auth/me'),
};

export const equipmentService = {
  getAll: (params) => api.get('/api/equipment', { params }),
  getById: (id) => api.get(`/api/equipment/${id}`),
  create: (data) => api.post('/api/equipment', data),
  update: (id, data) => api.put(`/api/equipment/${id}`, data),
  delete: (id) => api.delete(`/api/equipment/${id}`),
  getCategories: () => api.get('/api/equipment/categories'),
};

export const bookingService = {
  getAll: (params) => api.get('/api/bookings', { params }),
  getById: (id) => api.get(`/api/bookings/${id}`),
  create: (data) => api.post('/api/bookings', data),
  cancel: (id) => api.patch(`/api/bookings/${id}/cancel`),
  approve: (id) => api.patch(`/api/bookings/${id}/approve`),
  reject: (id, reason) => api.patch(`/api/bookings/${id}/reject`, { reason }),
  markInUse: (id) => api.patch(`/api/bookings/${id}/in-use`),
  markReturned: (id) => api.patch(`/api/bookings/${id}/returned`),
  markComplete: (id) => api.patch(`/api/bookings/${id}/complete`),
  getRecent: () => api.get('/api/bookings/recent'),
  suggestSlots: (equipmentId, date) => api.get(`/api/bookings/suggest-slots?equipmentId=${equipmentId}&date=${date}`),
};

export const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats'),
  getRecentBookings: () => api.get('/api/dashboard/recent-bookings'),
  getMyBookings: () => api.get('/api/dashboard/my-bookings'),
  getUtilizationChart: () => api.get('/api/dashboard/utilization-chart'),
  getEquipmentStatus: () => api.get('/api/dashboard/equipment-status'),
  getBookingTrends: () => api.get('/api/dashboard/booking-trends'),
  getDemandAnalytics: () => api.get('/api/dashboard/demand-analytics'),
  getHeatmap: (type = 'daily') => api.get(`/api/dashboard/heatmap?type=${type}`),
  getIdleEquipment: (days = 30) => api.get(`/api/dashboard/idle-equipment?days=${days}`),
};

export const institutionService = {
  getAll: () => api.get('/api/institutions'),
  getApproved: () => api.get('/api/institutions/approved'),
  getDepartments: (institutionId) => api.get(`/api/institutions/${institutionId}/departments`),
  updateStatus: (id, status) => api.put(`/api/institutions/${id}/status`, { status }),
  createDepartment: (id, data) => api.post(`/api/institutions/${id}/departments`, data),
};

export const partnershipService = {
  getAll: () => api.get('/api/partnerships'),
  getIncoming: () => api.get('/api/partnerships/incoming'),
  getOutgoing: () => api.get('/api/partnerships/outgoing'),
  request: (data) => api.post('/api/partnerships/request', data),
  updateStatus: (id, status) => api.put(`/api/partnerships/${id}/status`, { status }),
};

export const equipmentSharingService = {
  getSharedEquipment: () => api.get('/api/equipment-sharing/shared-equipment'),
  getIncoming: () => api.get('/api/equipment-sharing/incoming'),
  getOutgoing: () => api.get('/api/equipment-sharing/outgoing'),
  request: (data) => api.post('/api/equipment-sharing/request', data),
  updateStatus: (id, status) => api.put(`/api/equipment-sharing/${id}/status`, { status }),
};

export const waitlistService = {
  join: (equipmentId) => api.post('/api/waitlist/join', { equipmentId }),
  getMy: () => api.get('/api/waitlist/my-waitlist'),
  cancel: (id) => api.delete(`/api/waitlist/${id}`),
  getEquipmentWaitlist: (equipmentId) => api.get(`/api/waitlist/equipment/${equipmentId}`),
};

export const maintenanceService = {
  getAll: () => api.get('/api/maintenance'),
  create: (data) => api.post('/api/maintenance', data),
  approve: (id) => api.patch(`/api/maintenance/${id}/approve`),
  reject: (id, reason) => api.patch(`/api/maintenance/${id}/reject`, { reason }),
  complete: (id, notes) => api.patch(`/api/maintenance/${id}/complete`, { notes }),
  updateStatus: (id, status, notes) => api.patch(`/api/maintenance/${id}/status`, { status, notes }),
};

export const notificationService = {
  getAll: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

export const auditLogService = {
  getAll: () => api.get('/api/audit-logs'),
};

export const roleRequestService = {
  submit: (data) => api.post('/api/role-requests', data),
  getAll: () => api.get('/api/role-requests'),
  getMy: () => api.get('/api/role-requests/my'),
  approve: (id) => api.patch(`/api/role-requests/${id}/approve`),
  reject: (id, reason) => api.patch(`/api/role-requests/${id}/reject`, { reason }),
};

export const userService = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateStatus: (id, status) => api.patch(`/api/users/${id}/status`, { status }),
};

