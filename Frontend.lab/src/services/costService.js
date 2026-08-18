import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8081/api"
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getDashboardCost = () => API.get("/cost/dashboard");
export const getMonthlyCost = () => API.get("/cost/monthly");
export const getDepartmentCost = () => API.get("/cost/department");
export const getBilling = () => API.get("/cost/billing");
