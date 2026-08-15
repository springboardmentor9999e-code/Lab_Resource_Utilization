import axiosInstance from "../utils/axiosInstance";

const API = "/reports";

const getSummary = async () => {
    const response = await axiosInstance.get(`${API}/summary`);
    return response.data;
};

const getEquipmentUtilization = async () => {
    const response = await axiosInstance.get(`${API}/equipment-utilization`);
    return response.data;
};

const getProcurementCostAnalysis = async () => {
    const response = await axiosInstance.get("/reports/procurement-cost");
    return response.data;
};

const getInstitutionSharingReport = async () => {
    const response = await axiosInstance.get("/reports/institution-sharing");
    return response.data;
};

export default {
    getSummary,
    getEquipmentUtilization,
    getProcurementCostAnalysis,
    getInstitutionSharingReport
};