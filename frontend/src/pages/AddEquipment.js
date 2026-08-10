import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddEquipment() {

    const navigate = useNavigate();

    const [equipment, setEquipment] = useState({
        equipmentName: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
        department: "",
        laboratory: "",
        quantity: "",
        availableQuantity: "",
        status: "Available",
        purchaseDate: "",
        warrantyExpiry: "",
        remarks: ""
    });

    const [image, setImage] = useState(null);
    const [document, setDocument] = useState(null);

    const handleChange = (e) => {

        setEquipment({
            ...equipment,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // Save equipment

            const response = await axios.post(
                "http://localhost:8080/api/equipment",
                equipment
            );

            const equipmentId = response.data.id;

            // Upload files

            if (image || document) {

                const formData = new FormData();

                if (image) {
                    formData.append("image", image);
                }

                if (document) {
                    formData.append("document", document);
                }

                await axios.post(
                    `http://localhost:8080/api/equipment/upload/${equipmentId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
            }

            alert("Equipment Added Successfully");

            navigate("/equipment");

        } catch (error) {

            console.log(error);

            alert("Error Adding Equipment");
        }

    };

    return (

        <div
            style={{
                width: "700px",
                margin: "30px auto",
                background: "white",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 0 10px lightgray"
            }}
        >

            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "20px"
                }}
            >
                Add Equipment
            </h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="equipmentName"
                    placeholder="Equipment Name"
                    value={equipment.equipmentName}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={equipment.category}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={equipment.brand}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="model"
                    placeholder="Model"
                    value={equipment.model}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="serialNumber"
                    placeholder="Serial Number"
                    value={equipment.serialNumber}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={equipment.quantity}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <input
                    type="number"
                    name="availableQuantity"
                    placeholder="Available Quantity"
                    value={equipment.availableQuantity}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <select
                    name="status"
                    value={equipment.status}
                    onChange={handleChange}
                    style={inputStyle}
                >

                    <option>Available</option>
                    <option>Unavailable</option>

                </select>

                <label>Purchase Date</label>

                <input
                    type="date"
                    name="purchaseDate"
                    value={equipment.purchaseDate}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <label>Warranty Expiry</label>

                <input
                    type="date"
                    name="warrantyExpiry"
                    value={equipment.warrantyExpiry}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <textarea
                    name="remarks"
                    placeholder="Remarks"
                    value={equipment.remarks}
                    onChange={handleChange}
                    style={{
                        ...inputStyle,
                        height: "80px"
                    }}
                />

                <h3>Upload Equipment Image</h3>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImage(e.target.files[0])
                    }
                    style={{
                        marginBottom: "20px"
                    }}
                />

                <h3>Upload Equipment Document (PDF)</h3>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                        setDocument(e.target.files[0])
                    }
                    style={{
                        marginBottom: "20px"
                    }}
                />

                <br />

                <button
                    type="submit"
                    style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "12px 25px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    Add Equipment
                </button>

            </form>

        </div>

    );

}

const inputStyle = {

    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid gray",
    boxSizing: "border-box"

};

export default AddEquipment;