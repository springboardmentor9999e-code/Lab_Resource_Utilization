import axiosInstance from "../utils/axiosInstance";

const API_URL = "/resources";

// Get all resources
const getAllResources = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};

// Create resource
const createResource = async (resource) => {
    const response = await axiosInstance.post(API_URL, resource);
    return response.data;
};

// Update resource
const updateResource = async (id, resource) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, resource);
    return response.data;
};

// Delete resource
const deleteResource = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    getAllResources,
    createResource,
    updateResource,
    deleteResource,
};