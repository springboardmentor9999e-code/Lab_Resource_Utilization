import React, { useState } from "react";
import axios from "axios";

function UploadEquipment() {

    const [equipmentId, setEquipmentId] = useState("");
    const [image, setImage] = useState(null);
    const [document, setDocument] = useState(null);

    const uploadFiles = async () => {

        const formData = new FormData();

        formData.append("image", image);
        formData.append("document", document);

        try {

            await axios.post(
                `http://localhost:8080/api/equipment/upload/${equipmentId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Upload Successful");

        } catch (error) {

            alert("Upload Failed");

        }
    };

    return (
        <div className="container mt-4">

            <h2>Upload Equipment Files</h2>

            <input
                type="number"
                placeholder="Equipment ID"
                className="form-control mb-3"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
            />

            <input
                type="file"
                className="form-control mb-3"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
            />

            <input
                type="file"
                className="form-control mb-3"
                accept=".pdf"
                onChange={(e) => setDocument(e.target.files[0])}
            />

            <button
                className="btn btn-primary"
                onClick={uploadFiles}
            >
                Upload
            </button>

        </div>
    );
}

export default UploadEquipment;