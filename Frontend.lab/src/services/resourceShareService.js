import api from "./api";

const API_ENDPOINT = "/resource-sharing";

export const getAllShares = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data;
};

export const getSharedEquipment = async () => {
  const response = await api.get(`${API_ENDPOINT}/shared`);
  return response.data;
};

export const getShareById = async (id) => {
  const response = await api.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

export const createShare = async (shareData) => {
  const response = await api.post(API_ENDPOINT, shareData);
  return response.data;
};

export const approveShare = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/approve`);
  return response.data;
};

export const rejectShare = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/reject`);
  return response.data;
};

export const completeShare = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/complete`);
  return response.data;
};
