import axiosInstance from "../utils/axiosInstance";

const API_URL = "/maintenance";

// Get all maintenance
const getAllMaintenance = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};

// Get maintenance by ID
const getMaintenanceById = async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
};

// Create maintenance
const createMaintenance = async (maintenance) => {
    const response = await axiosInstance.post(API_URL, maintenance);
    return response.data;
};

// Update maintenance
const updateMaintenance = async (id, maintenance) => {
    const response = await axiosInstance.put(
        `${API_URL}/${id}`,
        maintenance
    );
    return response.data;
};

// Delete maintenance
const deleteMaintenance = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
};