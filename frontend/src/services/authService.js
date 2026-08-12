import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const registerUser = (userData) => {
    return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = (loginData) => {
    return axios.post(`${API_URL}/login`, loginData);
};

export const googleLogin = (googleData) => {
    return axios.post(`${API_URL}/google`, googleData);
};

export const getGoogleConfig = () => {
    return axios.get(`${API_URL}/google/config`);
};

export const forgotPassword = (email) => {
    return axios.post(`${API_URL}/forgot-password`, { email });
};

export const verifyOtp = (email, otp) => {
    return axios.post(`${API_URL}/verify-otp`, { email, otp });
};

export const resetPassword = (data) => {
    return axios.post(`${API_URL}/reset-password`, data);
};