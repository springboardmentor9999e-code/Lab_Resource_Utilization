import axios from "axios";

const API_URL = "http://localhost:8080/api/notifications";

const getToken = () => localStorage.getItem("token");

const config = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

const getNotifications = () => {
    return axios.get(API_URL, config());
};

const getUnreadCount = () => {
    return axios.get(`${API_URL}/unread-count`, config());
};

const markAsRead = (id) => {
    return axios.put(`${API_URL}/${id}/read`, {}, config());
};

const markAllAsRead = () => {
    return axios.put(`${API_URL}/read-all`, {}, config());
};

const notificationService = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};

export default notificationService;
