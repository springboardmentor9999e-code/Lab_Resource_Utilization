import axios from "axios";

const API_URL = "http://localhost:8080/api/laboratories";

const getToken = () => localStorage.getItem("token");

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// Get all laboratories
export const getAllLaboratories = () => {
    return axios.get(API_URL, config());
};

// Get laboratories by department
export const getLaboratoriesByDepartment = (departmentId) => {
    return axios.get(
        `${API_URL}?departmentId=${departmentId}`,
        config()
    );
};

// Get laboratory by ID
export const getLaboratoryById = (id) => {
    return axios.get(`${API_URL}/${id}`, config());
};

// Add laboratory
export const addLaboratory = (laboratory) => {
    return axios.post(API_URL, laboratory, config());
};

// Update laboratory
export const updateLaboratory = (id, laboratory) => {
    return axios.put(`${API_URL}/${id}`, laboratory, config());
};

// Delete laboratory
export const deleteLaboratory = (id) => {
    return axios.delete(`${API_URL}/${id}`, config());
};