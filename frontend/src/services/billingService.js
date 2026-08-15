import axiosInstance from "../utils/axiosInstance";

const billingService = {

    getBillingSummary: async () => {
        const response = await axiosInstance.get("/billing/summary");
        return response.data;
    },

    getAllBilling: async () => {
        const response = await axiosInstance.get("/billing/all");
        return response.data;
    },

    getDepartmentWiseCost: async () => {
        const response = await axiosInstance.get("/billing/department");
        return response.data;
    },

    markAsPaid: async (billingId) => {
        const response = await axiosInstance.put(`/billing/${billingId}/pay`);
        return response.data;
    },

    // Student / Faculty
    getMyBilling: async () => {
        const response = await axiosInstance.get("/billing/my");
        return response.data;
    },

    // Department Head
    getDepartmentBilling: async (userId) => {
        const response = await axiosInstance.get(
            `/billing/department-billing/${userId}`
        );
        return response.data;
    },

    // Institute Admin
    getInstitutionBilling: async (institutionId) => {
        const response = await axiosInstance.get(
            `/billing/institution/${institutionId}`
        );
        return response.data;
    }

};

export default billingService;