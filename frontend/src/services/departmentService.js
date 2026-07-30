import axios from "axios";

const API_URL = "http://localhost:8080/api/departments";

const getToken = () => {
    return localStorage.getItem("token");
};

const departmentService = {

    getAllDepartments: () => {
        return axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    getDepartmentsByInstitution: (institutionId) => {
        return axios.get(`${API_URL}?institutionId=${institutionId}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    getDepartmentById: (id) => {
        return axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    addDepartment: (department) => {
        return axios.post(API_URL, department, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    updateDepartment: (id, department) => {
        return axios.put(`${API_URL}/${id}`, department, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    deleteDepartment: (id) => {
        return axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    }

};

export default departmentService;