import axiosInstance from "../utils/axiosInstance";

const API_URL = "/laboratories";

const getAllLaboratories = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

const getLaboratoriesByInstitution = async () => {
  const response = await axiosInstance.get(`${API_URL}/institution`);
  return response.data;
};

const getLaboratoryById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

const createLaboratory = async (laboratory) => {
  const response = await axiosInstance.post(API_URL, laboratory);
  return response.data;
};

const updateLaboratory = async (id, laboratory) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, laboratory);
  return response.data;
};

const deleteLaboratory = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getAllLaboratories,
  getLaboratoriesByInstitution,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
};