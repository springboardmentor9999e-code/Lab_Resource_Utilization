import axios from "axios";

const API_URL = "http://localhost:8080/api/admin";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getPendingUsers = () => {
    return axios.get(
        `${API_URL}/pending-users`,
        getAuthHeader()
    );
};

export const approveUser = (userId) => {
    return axios.put(
        `${API_URL}/approve/${userId}`,
        {},
        getAuthHeader()
    );
};

export const rejectUser = (userId) => {
    return axios.put(
        `${API_URL}/reject/${userId}`,
        {},
        getAuthHeader()
    );
};