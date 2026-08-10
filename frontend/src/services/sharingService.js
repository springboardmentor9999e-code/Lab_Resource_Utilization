import axios from "axios";

const API = "http://localhost:8080/api/sharing";

export const createRequest = (data) =>
    axios.post(`${API}/request`, data);

export const getPendingRequests = () =>
    axios.get(`${API}/pending`);

export const getAllRequests = () =>
    axios.get(API);

export const approveRequest = (id) =>
    axios.put(`${API}/${id}/approve`);

export const rejectRequest = (id, remarks) =>
    axios.put(`${API}/${id}/reject?remarks=${remarks}`);