import api from './api';

export const billingService = {
  getEquipmentCosts: async (days = 30) => {
    const response = await api.get('/billing/costs/equipment', { params: { days } });
    return response.data;
  },
  getDepartmentCosts: async (days = 30) => {
    const response = await api.get('/billing/costs/departments', { params: { days } });
    return response.data;
  },
  generateInvoiceFromSharing: async (sharingRequestId) => {
    const response = await api.post(`/billing/invoices/from-sharing/${sharingRequestId}`);
    return response.data;
  },
  getOutgoingInvoices: async () => {
    const response = await api.get('/billing/invoices/outgoing');
    return response.data;
  },
  getIncomingInvoices: async () => {
    const response = await api.get('/billing/invoices/incoming');
    return response.data;
  },
  updateInvoiceStatus: async (id, status) => {
    const response = await api.patch(`/billing/invoices/${id}/status`, null, { params: { status } });
    return response.data;
  },
  getSummary: async (days = 30) => {
    const response = await api.get('/billing/summary', { params: { days } });
    return response.data;
  },
  getDepartmentCharges: async (departmentId, days = 30) => {
    const response = await api.get(`/billing/department-charges/${departmentId}`, {
      params: { days },
    });
    return response.data;
  },
  // Pass null to clear the budget. The param is omitted rather than sent as an empty
  // string so the backend sees a genuine "no value" and stores NULL.
  setAnnualBudget: async (departmentId, annualBudget) => {
    const response = await api.put(`/billing/departments/${departmentId}/budget`, null, {
      params: annualBudget == null || annualBudget === '' ? {} : { annualBudget },
    });
    return response.data;
  },
};

export default billingService;
