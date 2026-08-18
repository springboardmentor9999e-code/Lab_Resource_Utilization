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

export const getCalibrations = () =>
    API.get("/calibration");

export const getCalibrationById = (id) =>
    API.get(`/calibration/${id}`);

export const addCalibration = (data) =>
    API.post("/calibration", data);

export const updateCalibration = (id, data) =>
    API.put(`/calibration/${id}`, data);

export const deleteCalibration = (id) =>
    API.delete(`/calibration/${id}`);

export const getExpired = () =>
    API.get("/calibration/expired");

export const getUpcoming = () =>
    API.get("/calibration/upcoming");

export const getEquipment = () =>
    API.get("/equipment");
