import axiosInstance from "../utils/axiosInstance";

const API_URL = "/equipment";

// Get all equipment
const getAllEquipment = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

// Get equipment by ID
const getEquipmentById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

// Create equipment
const createEquipment = async (equipment) => {
  const response = await axiosInstance.post(API_URL, equipment);
  return response.data;
};

// Update equipment
const updateEquipment = async (id, equipment) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, equipment);
  return response.data;
};

// Delete equipment
const deleteEquipment = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};
const getEquipmentByLab = async (labId) => {
    const response = await axiosInstance.get(
        `/equipment/laboratory/${labId}`
    );

    return response.data;
};

const getEquipmentByInstitution = async () => {
    const response = await axiosInstance.get("/equipment/institution");
    return response.data;
};

export default {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentByLab,
  getEquipmentByInstitution,
};