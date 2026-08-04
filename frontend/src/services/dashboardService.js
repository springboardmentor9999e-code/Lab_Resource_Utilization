import api from "./api";

const getDashboardData = async () => {
    const response = await api.get("/dashboard");
    return response.data;
};

export default {
    getDashboardData,
};