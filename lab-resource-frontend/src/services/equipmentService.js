import axios from "axios";

const API = "http://localhost:8080/api/equipment";

export const getEquipment = () => axios.get(API);

export const addEquipment = (data) =>
    axios.post(API, data);

export const updateEquipment = (id, data) =>
    axios.put(`${API}/${id}`, data);

export const deleteEquipment = (id) =>
    axios.delete(`${API}/${id}`);