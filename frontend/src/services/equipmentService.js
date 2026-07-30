import axios from "axios";

const API_URL = "http://localhost:8080/api/equipment";

const getToken = () => localStorage.getItem("token");

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// Get all equipment
export const getAllEquipment = () => {
    return axios.get(API_URL, config());
};

// Get equipment by ID
export const getEquipmentById = (id) => {
    return axios.get(`${API_URL}/${id}`, config());
};

// Get equipment by laboratory
export const getEquipmentByLaboratory = (laboratoryId) => {
    return axios.get(
        `${API_URL}?laboratoryId=${laboratoryId}`,
        config()
    );
};

// Get equipment by category
export const getEquipmentByCategory = (category) => {
    return axios.get(
        `${API_URL}?category=${category}`,
        config()
    );
};

// Get equipment by status
export const getEquipmentByStatus = (status) => {
    return axios.get(
        `${API_URL}?status=${status}`,
        config()
    );
};

// Search equipment
export const searchEquipment = (search) => {
    return axios.get(
        `${API_URL}?search=${search}`,
        config()
    );
};

// Add equipment
export const addEquipment = (equipment) => {
    return axios.post(API_URL, equipment, config());
};

// Update equipment
export const updateEquipment = (id, equipment) => {
    return axios.put(
        `${API_URL}/${id}`,
        equipment,
        config()
    );
};

// Delete equipment
export const deleteEquipment = (id) => {
    return axios.delete(`${API_URL}/${id}`, config());
};