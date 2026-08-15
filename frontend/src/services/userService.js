import axiosInstance from "../utils/axiosInstance";

const API_URL = "http://localhost:8080/api/users";

const getAllUsers = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

const createUser = async (user) => {
  const response = await axiosInstance.post(API_URL, user);
  return response.data;
};
const updateUser = async (id, user) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, user);
  return response.data;
};
const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};
const getProfile = async () => {
    const response = await axiosInstance.get(`${API_URL}/profile`);
    return response.data;
};

const updateProfile = async (user) => {
    const response = await axiosInstance.put(
        `${API_URL}/profile`,
        user
    );
    return response.data;
};

const changePassword = async (passwordData) => {
    const response = await axiosInstance.put(
        `${API_URL}/change-password`,
        passwordData
    );

    return response.data;
};



export default {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
};