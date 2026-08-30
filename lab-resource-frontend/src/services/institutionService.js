import axios from "axios";

const API = "http://localhost:8080/api/institutions";

export const getInstitutions = () => axios.get(API);

export const addInstitution = (data) =>
    axios.post(API, data);

export const updateInstitution = (id, data) =>
    axios.put(`${API}/${id}`, data);

export const deleteInstitution = (id) =>
    axios.delete(`${API}/${id}`);