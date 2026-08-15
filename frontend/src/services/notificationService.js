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
    const response = await axiosInstance.delete(`${API}/${id}`);
    return response.data;
};

const getUnreadCount = async (userId) => {
  const response = await axiosInstance.get(
    `${API}/user/${userId}/unread-count`
  );
  return response.data;
};

const markAllAsRead = async (userId) => {
    console.log("Calling:", `${API}/user/${userId}/read-all`);

    const response = await axiosInstance.put(
        `${API}/user/${userId}/read-all`
    );

    return response.data;
};

const deleteAllRead = async (userId) => {
    console.log("Calling:", `${API}/user/${userId}/delete-read`);

    const response = await axiosInstance.delete(
        `${API}/user/${userId}/delete-read`
    );

    return response.data;
};

export default {
    getAllNotifications,
    getNotificationsByUser,
    createNotification,
    updateNotification,
    markAsRead,
    deleteNotification,
    getUnreadCount,
    markAllAsRead,
    deleteAllRead,
};