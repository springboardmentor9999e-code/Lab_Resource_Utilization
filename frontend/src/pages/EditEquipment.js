import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditEquipment() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [equipmentName, setEquipmentName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [availableQuantity, setAvailableQuantity] = useState("");
    const [status, setStatus] = useState("");
    const [image, setImage] = useState(null);

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/equipment/${id}`
            );

            setEquipmentName(response.data.equipmentName);
            setCategory(response.data.category);
            setQuantity(response.data.quantity);
            setAvailableQuantity(response.data.availableQuantity);
            setStatus(response.data.status);

        } catch (error) {
            console.error(error);
        }
    };

    const updateEquipment = async () => {

        const formData = new FormData();

        formData.append("equipmentName", equipmentName);
        formData.append("category", category);
        formData.append("quantity", quantity);
        formData.append("availableQuantity", availableQuantity);
        formData.append("status", status);

        if (image) {
            formData.append("image", image);
        }

        try {

            await axios.put(
                `http://localhost:8080/api/equipment/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert("Equipment Updated Successfully");
            navigate("/equipment");

        } catch (error) {
            console.error(error);
            alert("Update Failed");
        }
    };

    return (
        <div className="equipment-container">

            <h2>Edit Equipment</h2>

            <input
                type="text"
                placeholder="Equipment Name"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            />

            <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />

            <input
                type="number"
                placeholder="Available Quantity"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
            />

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Unavailable">Unavailable</option>
            </select>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
            />

            <button onClick={updateEquipment}>
                Update Equipment
            </button>

        </div>
    );
}

export default EditEquipment;