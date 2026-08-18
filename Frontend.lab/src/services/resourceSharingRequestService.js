import api from "./api";

const API_ENDPOINT = "/resource-sharing-requests";

export const getAllRequests = async (status) => {
  const params = status && status !== "ALL" ? { status } : {};
  const response = await api.get(API_ENDPOINT, { params });
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await api.get(`${API_ENDPOINT}/pending`);
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await api.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

export const getRequestsByRequestingLab = async (labId) => {
  const response = await api.get(`${API_ENDPOINT}/requesting-lab/${labId}`);
  return response.data;
};

export const getRequestsByProviderLab = async (labId) => {
  const response = await api.get(`${API_ENDPOINT}/provider-lab/${labId}`);
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await api.post(API_ENDPOINT, requestData);
  return response.data;
};

export const approveRequest = async (id) => {
  const response = await api.post(`${API_ENDPOINT}/${id}/approve`);
  return response.data;
};

export const activateRequest = async (id) => {
  const response = await api.post(`${API_ENDPOINT}/${id}/activate`);
  return response.data;
};

export const rejectRequest = async (id, reason = "") => {
  const response = await api.post(`${API_ENDPOINT}/${id}/reject`, null, {
    params: { reason },
  });
  return response.data;
};

export const deleteRequest = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};
