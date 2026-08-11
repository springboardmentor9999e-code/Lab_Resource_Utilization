import axios from "axios";

const API_URL = "http://localhost:8080/api/resource-sharing";

const getToken = () => localStorage.getItem("token");

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

export const createSharingRequest = (requestData) => {
    return axios.post(`${API_URL}/request`, requestData, config());
};

export const getIncomingRequests = () => {
    return axios.get(`${API_URL}/incoming`, config());
};

export const getOutgoingRequests = () => {
    return axios.get(`${API_URL}/outgoing`, config());
};

export const getMyRequests = () => {
    return axios.get(`${API_URL}/my-requests`, config());
};

export const getAllRequests = () => {
    return axios.get(`${API_URL}/all`, config());
};

export const getAvailableEquipmentForSharing = (targetInstitutionId) => {
    const url = targetInstitutionId 
        ? `${API_URL}/available-equipment?targetInstitutionId=${targetInstitutionId}`
        : `${API_URL}/available-equipment`;
    return axios.get(url, config());
};

export const approveSharingRequest = (id) => {
    return axios.put(`${API_URL}/${id}/approve`, {}, config());
};

export const rejectSharingRequest = (id, reason) => {
    return axios.put(`${API_URL}/${id}/reject`, { reason }, config());
};

export const cancelSharingRequest = (id) => {
    return axios.put(`${API_URL}/${id}/cancel`, {}, config());
};

export const getActiveSharedEquipmentForInstitution = (institutionId) => {
    return axios.get(`${API_URL}/active-shared-to-institute/${institutionId}`, config());
};

export const getSharingAnalytics = (params) => {
    return axios.get(`${API_URL}/analytics`, { ...config(), params });
};

export const getSharingStats = () => {
    return axios.get(`${API_URL}/stats`, config());
};
