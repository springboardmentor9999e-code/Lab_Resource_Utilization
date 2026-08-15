import axiosInstance from "../utils/axiosInstance";

const certificationService = {

    getAll: async () => {
        const response = await axiosInstance.get("/certifications");
        return response.data;
    },

    create: async (data) => {
        const response = await axiosInstance.post("/certifications", data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosInstance.put(
            `/certifications/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(
            `/certifications/${id}`
        );
        return response.data;
    },

    getExpired: async () => {
        const response = await axiosInstance.get("/certifications/expired");
        return response.data;
    },

    getExpiring: async () => {
        const response = await axiosInstance.get("/certifications/expiring");
        return response.data;
    },

    getReminders: async () => {
        const response = await axiosInstance.get("/certifications/reminders");
        return response.data;
    },

    // Role Based APIs
    getByInstitution: async () => {
        const response = await axiosInstance.get("/certifications/institution");
        return response.data;
    },

    getByDepartment: async () => {
        const response = await axiosInstance.get("/certifications/department");
        return response.data;
    },

    getByLab: async () => {
        const response = await axiosInstance.get("/certifications/laboratory");
        return response.data;
    },

    getByFaculty: async () => {
        const response = await axiosInstance.get("/certifications/faculty");
        return response.data;
    },

    getByStudent: async () => {
        const response = await axiosInstance.get("/certifications/student");
        return response.data;
    }

};

export default certificationService;