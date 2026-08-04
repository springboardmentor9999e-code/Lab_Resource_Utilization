import axiosInstance from "../utils/axiosInstance";

const API = "/institutions";

const getAllInstitutions = async () => {
    const response = await axiosInstance.get(API);
    return response.data;
};

const createInstitution = async (institution) => {
    const response = await axiosInstance.post(API, institution);
    return response.data;
};

const updateInstitution = async (id, institution) => {
    const response = await axiosInstance.put(`${API}/${id}`, institution);
    return response.data;
};

const deleteInstitution = async (id) => {
    return axiosInstance.delete(`${API}/${id}`);
};

export default {
    getAllInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
};