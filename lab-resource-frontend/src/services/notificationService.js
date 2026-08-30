import axios from "axios";

const API = "http://localhost:8080/api/notifications";

export const getNotificationsByRole = async (role) => {
    const response = await axios.get(`${API}/role/${role}`);
    return response.data;
};

export const getNotificationsByEmail = async (email) => {
    const response = await axios.get(`${API}/email/${email}`);
    return response.data;
};

export const markAsRead = async (id) => {
    return axios.put(`${API}/${id}/read`);
};