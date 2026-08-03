import axios from "axios";

const API_URL = "http://localhost:8080/api/profile";

const getToken = () => {
    return localStorage.getItem("token");
};

const userService = {

    getUserProfile: () => {
        return axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    updateUserProfile: (profileData) => {
        return axios.put(API_URL, profileData, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    changePassword: (passwordData) => {
        return axios.put(`${API_URL}/change-password`, passwordData, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    }

};

export default userService;
