import api from "./api";

const API_ENDPOINT = "/sharing-agreements";

export const getAllAgreements = async (status) => {
  const params = status && status !== "ALL" ? { status } : {};
  const response = await api.get(API_ENDPOINT, { params });
  return response.data;
};

export const getAgreementById = async (id) => {
  const response = await api.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

export const getAgreementsByLabId = async (labId) => {
  const response = await api.get(`${API_ENDPOINT}/laboratory/${labId}`);
  return response.data;
};

export const createAgreement = async (agreementData) => {
  const response = await api.post(API_ENDPOINT, agreementData);
  return response.data;
};

export const approveAgreement = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/approve`);
  return response.data;
};

export const activateAgreement = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/activate`);
  return response.data;
};

export const rejectAgreement = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/reject`);
  return response.data;
};

export const terminateAgreement = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/terminate`);
  return response.data;
};

export const deleteAgreement = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};
