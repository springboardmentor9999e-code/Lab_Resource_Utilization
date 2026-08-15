import axiosInstance from "../utils/axiosInstance";

const getStudentDashboard = async () => {
    const response = await axiosInstance.get("/dashboard/student");
    return response.data;
};

const getDepartmentDashboard = async () => {
    const response = await axiosInstance.get("/dashboard/department");
    return response.data;
};

const getInstitutionDashboard = async () => {
    const response = await axiosInstance.get("/dashboard/institution");
    return response.data;
};

export default {
    getStudentDashboard,
    getDepartmentDashboard,
    getInstitutionDashboard,
};