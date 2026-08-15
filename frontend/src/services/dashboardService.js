import axiosInstance from "../utils/axiosInstance";

const getDashboardData = async () => {
    const response = await axiosInstance.get("/reports/summary");
    return response.data;
};

export default {
    getDashboardData,
};