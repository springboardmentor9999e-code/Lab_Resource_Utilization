import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/calibration.css";
import "../styles/dashboard.css";

function Calibration() {
    const [calibrations, setCalibrations] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [file, setFile] = useState(null);

    const [form, setForm] = useState({
        resourceId: "",
        calibrationDate: "",
        nextDueDate: "",
        performedBy: "",
        remarks: "",
        status: "Completed"
    });

    const API = "http://localhost:8080/api";

    // ================================
    // LOAD DATA
    // ================================

    useEffect(() => {
        loadCalibration();
        loadEquipment();
    }, []);

    const loadCalibration = () => {
        axios
            .get(`${API}/calibration`)
            .then((res) => {
                setCalibrations(res.data);
            })
            .catch((err) => {
                console.log("Error loading calibration:", err);
            });
    };

    const loadEquipment = () => {
        axios
            .get(`${API}/equipment`)
            .then((res) => {
                setEquipment(res.data);
            })
            .catch((err) => {
                console.log("Error loading equipment:", err);
            });
    };

    // ================================
    // FORM HANDLERS
    // ================================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // ================================
    // SAVE CALIBRATION
    // ================================

    const saveCalibration = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("resourceId", form.resourceId);
        formData.append("calibrationDate", form.calibrationDate);
        formData.append("nextDueDate", form.nextDueDate);
        formData.append("performedBy", form.performedBy);
        formData.append("remarks", form.remarks);
        formData.append("status", form.status);

        if (file) {
            formData.append("certificateFile", file);
        }

        try {
            await axios.post(
                `${API}/calibration`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert("Calibration Saved Successfully");

            // Reload calibration history
            loadCalibration();

            // Reset form
            setForm({
                resourceId: "",
                calibrationDate: "",
                nextDueDate: "",
                performedBy: "",
                remarks: "",
                status: "Completed"
            });

            setFile(null);

        } catch (error) {
            console.log("Calibration save error:", error);

            if (error.response) {
                console.log(
                    "Backend response:",
                    error.response.data
                );
            }

            alert("Error saving calibration");
        }
    };

    // ================================
    // GET EQUIPMENT NAME
    // ================================

    const getEquipmentName = (resourceId) => {
        const selectedEquipment = equipment.find(
            (item) => item.id === resourceId
        );

        if (selectedEquipment) {
            return selectedEquipment.equipmentName;
        }

        return `Equipment #${resourceId}`;
    };

    // ================================
    // RENDER
    // ================================

    return (
        <div className="dashboard calibration-page">

            {/* ================================
                PAGE HEADER
            ================================= */}

            <div className="dashboard-header">
                <h1>
                    Equipment Calibration & Compliance
                </h1>

                <p>
                    Log calibration records, track scheduled
                    due dates, and manage compliance certificates
                </p>
            </div>

            {/* ================================
                CALIBRATION FORM
            ================================= */}

            <div
                className="chart-card calibration-form-card"
                style={{
                    maxWidth: "680px",
                    margin: "0 auto 30px auto"
                }}
            >

                <h3>
                    Record Calibration & Certification
                </h3>

                <form
                    onSubmit={saveCalibration}
                    className="calibration-form"
                >

                    {/* EQUIPMENT */}

                    <div className="calibration-form-group">

                        <label>
                            Select Equipment
                        </label>

                        <select
                            name="resourceId"
                            value={form.resourceId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                -- Choose Equipment --
                            </option>

                            {equipment.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.equipmentName} (
                                    {item.category || "General"}
                                    )
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* DATES */}

                    <div className="calibration-date-grid">

                        <div className="calibration-form-group">

                            <label>
                                Calibration Date
                            </label>

                            <input
                                type="date"
                                name="calibrationDate"
                                value={form.calibrationDate}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="calibration-form-group">

                            <label>
                                Next Due Date
                            </label>

                            <input
                                type="date"
                                name="nextDueDate"
                                value={form.nextDueDate}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                    {/* PERFORMED BY */}

                    <div className="calibration-form-group">

                        <label>
                            Performed By
                        </label>

                        <input
                            type="text"
                            name="performedBy"
                            value={form.performedBy}
                            onChange={handleChange}
                            placeholder="Certifying Technician / Organization"
                            required
                        />

                    </div>

                    {/* CERTIFICATE */}

                    <div className="calibration-form-group">

                        <label>
                            Upload Calibration Certificate
                        </label>

                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />

                        {file && (
                            <small className="selected-file-name">
                                Selected file: {file.name}
                            </small>
                        )}

                    </div>

                    {/* REMARKS */}

                    <div className="calibration-form-group">

                        <label>
                            Remarks
                        </label>

                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            placeholder="Enter calibration findings and tolerances..."
                            rows="3"
                        />

                    </div>

                    {/* STATUS */}

                    <div className="calibration-form-group">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Expired">
                                Expired
                            </option>
                        </select>

                    </div>

                    {/* SAVE BUTTON */}

                    <button
                        type="submit"
                        className="save-calibration-button"
                    >
                        Save Calibration Record
                    </button>

                </form>

            </div>

            {/* ================================
                CALIBRATION HISTORY
            ================================= */}

            <div className="chart-card calibration-history-card">

                <h3>
                    Calibration Log History
                </h3>

                {/* IMPORTANT:
                    Only this container scrolls horizontally.
                    The entire page/sidebar will not scroll.
                */}

                <div className="calibration-table-wrapper">

                    <table className="calibration-table">

                        <thead>

                        <tr>

                            <th>
                                Equipment
                            </th>

                            <th>
                                Calibration Date
                            </th>

                            <th>
                                Next Due Date
                            </th>

                            <th>
                                Performed By
                            </th>

                            <th>
                                Certificate
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                        </thead>

                        <tbody>

                        {calibrations.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="no-calibration-data"
                                >
                                    No calibration records found.
                                </td>

                            </tr>

                        ) : (

                            calibrations.map((cal) => (

                                <tr
                                    key={cal.calibrationId}
                                >

                                    {/* EQUIPMENT */}

                                    <td>

                                        <strong>
                                            {getEquipmentName(
                                                cal.resourceId
                                            )}
                                        </strong>

                                    </td>

                                    {/* CALIBRATION DATE */}

                                    <td>
                                        {cal.calibrationDate}
                                    </td>

                                    {/* NEXT DUE DATE */}

                                    <td>
                                        {cal.nextDueDate}
                                    </td>

                                    {/* PERFORMED BY */}

                                    <td>
                                        {cal.performedBy}
                                    </td>

                                    {/* CERTIFICATE */}

                                    <td
                                        className="certificate-cell"
                                        title={
                                            cal.certificateFile ||
                                            "No File Uploaded"
                                        }
                                    >

                                        {cal.certificateFile
                                            ? cal.certificateFile
                                            : "No File Uploaded"}

                                    </td>

                                    {/* STATUS */}

                                    <td>

                                            <span
                                                className={`calibration-status ${
                                                    cal.status ===
                                                    "Completed"
                                                        ? "status-completed"
                                                        : cal.status ===
                                                        "Pending"
                                                            ? "status-pending"
                                                            : "status-expired"
                                                }`}
                                            >
                                                {cal.status}
                                            </span>

                                    </td>

                                </tr>

                            ))

                        )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default Calibration;