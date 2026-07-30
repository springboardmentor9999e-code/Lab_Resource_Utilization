import axios from "axios";

const API_URL = "http://localhost:8080/api/institutions";

const getToken = () => {
    return localStorage.getItem("token");
};

const institutionService = {

    getAllInstitutions: () => {
        return axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    getInstitutionById: (id) => {
        return axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    addInstitution: (institution) => {
        return axios.post(API_URL, institution, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    updateInstitution: (id, institution) => {
        return axios.put(`${API_URL}/${id}`, institution, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    deleteInstitution: (id) => {
        return axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    }

};

export default institutionService;