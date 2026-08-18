import api from "./api";

const API_ENDPOINT = "/resource-sharing";

export const createRequest = async (requestData) => {
  return api.post(API_ENDPOINT, requestData);
};

export const getRequests = async () => {
  return api.get(API_ENDPOINT);
};

export const approve = async (id) => {
  return api.put(`${API_ENDPOINT}/${id}/approve`, {});
};

export const reject = async (id) => {
  return api.put(`${API_ENDPOINT}/${id}/reject`, {});
};

export const complete = async (id) => {
  return api.put(`${API_ENDPOINT}/${id}/complete`, {});
};

// Aliases for compatibility
export const approveRequest = approve;
export const rejectRequest = reject;
export const completeRequest = complete;

