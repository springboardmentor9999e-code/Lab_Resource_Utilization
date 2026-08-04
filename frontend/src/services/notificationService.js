import axiosInstance from "../utils/axiosInstance";

const API = "http://localhost:8080/api/notifications";

const getAllNotifications = async () => {
    const response = await axiosInstance.get(API);
    return response.data;
};

const getNotificationsByUser = async (userId) => {
    const response = await axiosInstance.get(`${API}/user/${userId}`);
    return response.data;
};

const createNotification = async (notification) => {
    const response = await axiosInstance.post(API, notification);
    return response.data;
};

const updateNotification = async (id, notification) => {
    const response = await axiosInstance.put(`${API}/${id}`, notification);
    return response.data;
};

const markAsRead = async (id) => {
    const response = await axiosInstance.put(`${API}/${id}/read`);
    return response.data;
};

const deleteNotification = async (id) => {
    return axios.delete(`${API}/${id}`);
};

export default {
    getAllNotifications,
    getNotificationsByUser,
    createNotification,
    updateNotification,
    markAsRead,
    deleteNotification,
};