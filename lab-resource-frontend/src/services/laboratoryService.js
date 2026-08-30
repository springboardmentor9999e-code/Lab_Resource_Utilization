import axios from "axios";

const API = "http://localhost:8080/api/laboratories";

export const getLaboratories = () => axios.get(API);

export const addLaboratory = (data) =>
    axios.post(API, data);

export const updateLaboratory = (id, data) =>
    axios.put(`${API}/${id}`, data);

export const deleteLaboratory = (id) =>
    axios.delete(`${API}/${id}`);