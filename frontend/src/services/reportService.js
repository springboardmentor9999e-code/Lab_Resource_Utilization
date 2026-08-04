import axios from "axios";

const API = "http://localhost:8080/api/reports";

const getSummary = async () => {
    const response = await axios.get(`${API}/summary`);
    return response.data;
};

export default {
    getSummary
};