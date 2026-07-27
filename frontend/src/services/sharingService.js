import api from './api';

export const sharingService = {
  // Cross-institution discovery of shareable equipment
  discover: async (params) => {
    const response = await api.get('/sharing/discover', { params });
    return response.data;
  },

  createRequest: async (data) => {
    const response = await api.post('/sharing/requests', data);
    return response.data; // ApiResponse<SharingRequestResponse>
  },

  getIncoming: async () => {
    const response = await api.get('/sharing/requests/incoming');
    return response.data;
  },

  getOutgoing: async () => {
    const response = await api.get('/sharing/requests/outgoing');
    return response.data;
  },

  approve: async (id, remarks) => {
    const response = await api.patch(`/sharing/requests/${id}/approve`, null, {
      params: remarks ? { remarks } : {},
    });
    return response.data;
  },

  reject: async (id, remarks) => {
    const response = await api.patch(`/sharing/requests/${id}/reject`, null, {
      params: remarks ? { remarks } : {},
    });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/sharing/requests/${id}`);
    return response.data;
  },

  // Sharing agreements — the standing terms requests are evaluated under
  getAgreements: async () => {
    const response = await api.get('/sharing/agreements');
    return response.data;
  },

  proposeAgreement: async (data) => {
    const response = await api.post('/sharing/agreements', data);
    return response.data; // ApiResponse<SharingAgreementResponse>
  },

  updateAgreementStatus: async (id, status) => {
    const response = await api.patch(`/sharing/agreements/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Sharing analytics & partnership reporting
  getPartnershipReport: async (days = 90) => {
    const response = await api.get('/sharing/partnerships', { params: { days } });
    return response.data;
  },

  // Institution lookup
  getInstitutions: async () => {
    const response = await api.get('/institutions');
    return response.data;
  },
};
