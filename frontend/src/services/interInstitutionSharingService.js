import axiosInstance from "../utils/axiosInstance";

const API_URL = "/inter-sharing";

// Get all
const getAllSharing = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

// Get by id
const getSharingById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

// Create
const createSharing = async (sharing) => {
  const response = await axiosInstance.post(API_URL, sharing);
  return response.data;
};

// Update
const updateSharing = async (id, sharing) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, sharing);
  return response.data;
};

// Delete
const deleteSharing = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

const approveSharing = async (id) => {
  const response = await axiosInstance.put(`${API_URL}/${id}/approve`);
  return response.data;
};

const rejectSharing = async (id) => {
  const response = await axiosInstance.put(`${API_URL}/${id}/reject`);
  return response.data;
};

export default {
  getAllSharing,
  getSharingById,
  createSharing,
  updateSharing,
  deleteSharing,
  approveSharing,
  rejectSharing,
};