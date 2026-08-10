import axios from "axios";

const API_URL = "http://localhost:8080/api/equipment";

const getAllEquipment = () => {
    return axios.get(API_URL);
};

const getEquipmentById = (id) => {
    return axios.get(API_URL + "/" + id);
};

const addEquipment = (equipment) => {
    return axios.post(API_URL, equipment);
};

const updateEquipment = (id, equipment) => {
    return axios.put(API_URL + "/" + id, equipment);
};

const deleteEquipment = (id) => {
    return axios.delete(API_URL + "/" + id);
};

const EquipmentService = {
    getAllEquipment,
    getEquipmentById,
    addEquipment,
    updateEquipment,
    deleteEquipment
};

export default EquipmentService;