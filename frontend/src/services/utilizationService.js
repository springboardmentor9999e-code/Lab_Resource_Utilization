import api from "./api";

const getSummary = async () => {
    const response = await api.get("/utilization/summary");
    return response.data;
};

const getEquipmentUtilization = async () => {
    const response = await api.get("/utilization/equipment");
    return response.data;
};

const getInstitutionUtilization = async () => {
    const response = await api.get("/utilization/institutions");
    return response.data;
};

const getDepartmentUtilization = async () => {
    const response = await api.get("/utilization/departments");
    return response.data;
};

const getPeakUsageData = async () => {
    const response = await api.get("/utilization/peak-usage");
    return response.data;
};

const getHeatmap = async () => {
    const response = await api.get("/utilization/heatmap");
    return response.data;
};

const getUtilizationTrend = async () => {
    const response = await api.get("/utilization/trend");
    return response.data;
};

const getIdleEquipment = async () => {

    const response =
        await api.get("/utilization/idle-equipment");

    return response.data;

};

export default {
    getSummary,
    getEquipmentUtilization,
    getInstitutionUtilization,
    getDepartmentUtilization,
    getPeakUsageData,
    getHeatmap,
    getUtilizationTrend,
    getIdleEquipment,
};