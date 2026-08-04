import axiosInstance from "../utils/axiosInstance";

const API_URL = "/roles";

const getAllRoles = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};

export default {
    getAllRoles,
};