import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function CalibrationCertification() {

    const role = localStorage.getItem("role");

    const [calibrationList, setCalibrationList] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);

    const [calibration, setCalibration] = useState({
        calibrationId: "",
        equipmentId: "",
        calibrationDate: "",
        nextCalibrationDate: "",
        certificationName: "",
        certificationExpiryDate: "",
        status: "VALID",
        notes: ""
    });


    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {

    // Fetch calibration records
    try {

        const calibrationRes = await api.get("/calibration");

        console.log("Calibration data:", calibrationRes.data);

        setCalibrationList(calibrationRes.data);

    } catch (error) {

        console.error("Calibration API error:", error);
    }


    // Fetch equipment
    try {

        const equipmentRes = await api.get("/equipment");

        console.log("Equipment data:", equipmentRes.data);

        setEquipmentList(equipmentRes.data);

    } catch (error) {

        console.error("Equipment API error:", error);

    }

};


    const handleChange = (e) => {

        setCalibration({
            ...calibration,
            [e.target.name]: e.target.value
        });

    };


    const clearForm = () => {

        setCalibration({
            calibrationId: "",
            equipmentId: "",
            calibrationDate: "",
            nextCalibrationDate: "",
            certificationName: "",
            certificationExpiryDate: "",
            status: "VALID",
            notes: ""
        });

        setEditing(false);

    };


    const saveCalibration = async () => {

        try {

            if (!calibration.equipmentId) {

                alert("Please select equipment.");
                return;

            }

            if (editing) {

                await api.put(
                    `/calibration/${calibration.calibrationId}`,
                    calibration
                );

                alert("Calibration record updated successfully.");

            } else {

                await api.post(
                    "/calibration",
                    calibration
                );

                alert("Calibration record created successfully.");

            }

            fetchData();
            clearForm();
            setShowForm(false);

        } catch (error) {

            console.log(error);

            alert("Failed to save calibration record.");

        }

    };


    const editCalibration = (item) => {

        setCalibration({
            calibrationId: item.calibrationId,
            equipmentId: item.equipmentId,
            calibrationDate: item.calibrationDate || "",
            nextCalibrationDate: item.nextCalibrationDate || "",
            certificationName: item.certificationName || "",
            certificationExpiryDate: item.certificationExpiryDate || "",
            status: item.status || "VALID",
            notes: item.notes || ""
        });

        setEditing(true);
        setShowForm(true);

    };


    const deleteCalibration = async (id) => {

        if (!window.confirm("Delete this calibration record?")) {
            return;
        }

        try {

            await api.delete(`/calibration/${id}`);

            alert("Record deleted successfully.");

            fetchData();

        } catch (error) {

            console.log(error);

            alert("Failed to delete record.");

        }

    };


    const getEquipmentName = (id) => {

        const equipment = equipmentList.find(
            e => e.equipmentId === id
        );

        return equipment
            ? equipment.equipmentName
            : "-";

    };


    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>Calibration & Certification</h1>

                <hr />


                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                    }}
                >

                    <h2>Calibration Records</h2>


                    {role === "SYSTEM_ADMIN" && (

                        <button
                            onClick={() => {

                                clearForm();
                                setShowForm(true);

                            }}
                        >
                            + Add Calibration
                        </button>

                    )}

                </div>


                {showForm && (

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            borderRadius: "10px",
                            marginBottom: "20px"
                        }}
                    >

                        <h3>
                            {editing
                                ? "Edit Calibration Record"
                                : "Add Calibration Record"}
                        </h3>


                        <label>Equipment</label>

                        <br />

                        <select
                            name="equipmentId"
                            value={calibration.equipmentId}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Equipment
                            </option>

                            {equipmentList.map((equipment) => (

                                <option
                                    key={equipment.equipmentId}
                                    value={equipment.equipmentId}
                                >
                                    {equipment.equipmentName}
                                </option>

                            ))}

                        </select>


                        <br />
                        <br />


                        <label>Calibration Date</label>

                        <br />

                        <input
                            type="date"
                            name="calibrationDate"
                            value={calibration.calibrationDate}
                            onChange={handleChange}
                        />


                        <br />
                        <br />


                        <label>Next Calibration Date</label>

                        <br />

                        <input
                            type="date"
                            name="nextCalibrationDate"
                            value={calibration.nextCalibrationDate}
                            onChange={handleChange}
                        />


                        <br />
                        <br />


                        <label>Certification Name</label>

                        <br />

                        <input
                            type="text"
                            name="certificationName"
                            value={calibration.certificationName}
                            onChange={handleChange}
                            placeholder="Example: ISO Calibration Certificate"
                        />


                        <br />
                        <br />


                        <label>Certification Expiry Date</label>

                        <br />

                        <input
                            type="date"
                            name="certificationExpiryDate"
                            value={calibration.certificationExpiryDate}
                            onChange={handleChange}
                        />


                        <br />
                        <br />


                        <label>Status</label>

                        <br />

                        <select
                            name="status"
                            value={calibration.status}
                            onChange={handleChange}
                        >

                            <option value="VALID">
                                VALID
                            </option>

                            <option value="EXPIRING_SOON">
                                EXPIRING SOON
                            </option>

                            <option value="EXPIRED">
                                EXPIRED
                            </option>

                        </select>


                        <br />
                        <br />


                        <label>Notes</label>

                        <br />

                        <textarea
                            name="notes"
                            value={calibration.notes}
                            onChange={handleChange}
                            placeholder="Enter notes"
                        />


                        <br />
                        <br />


                        <button onClick={saveCalibration}>

                            {editing
                                ? "Update"
                                : "Save"}

                        </button>


                        <button
                            onClick={() => {

                                clearForm();
                                setShowForm(false);

                            }}
                            style={{ marginLeft: "10px" }}
                        >
                            Cancel
                        </button>

                    </div>

                )}


                <table
                    border="1"
                    cellPadding="10"
                    width="100%"
                >

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Equipment</th>

                            <th>Calibration Date</th>

                            <th>Next Calibration</th>

                            <th>Certification</th>

                            <th>Expiry Date</th>

                            <th>Status</th>

                            <th>Notes</th>

                            {role === "SYSTEM_ADMIN" && (
                                <th>Action</th>
                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {calibrationList.map((item) => (

                            <tr key={item.calibrationId}>

                                <td>
                                    {item.calibrationId}
                                </td>

                                <td>
                                    {getEquipmentName(
                                        item.equipmentId
                                    )}
                                </td>

                                <td>
                                    {item.calibrationDate}
                                </td>

                                <td>
                                    {item.nextCalibrationDate}
                                </td>

                                <td>
                                    {item.certificationName || "-"}
                                </td>

                                <td>
                                    {item.certificationExpiryDate || "-"}
                                </td>

                                <td>

                                    <span
                                        style={{
                                            backgroundColor:
                                                item.status === "VALID"
                                                    ? "green"
                                                    : item.status === "EXPIRED"
                                                    ? "red"
                                                    : "orange",

                                            color: "white",

                                            padding: "5px 10px",

                                            borderRadius: "8px",

                                            fontWeight: "bold"
                                        }}
                                    >

                                        {item.status}

                                    </span>

                                </td>

                                <td>
                                    {item.notes || "-"}
                                </td>


                                {role === "SYSTEM_ADMIN" && (

                                    <td>

                                        <button
                                            onClick={() =>
                                                editCalibration(item)
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            onClick={() =>
                                                deleteCalibration(
                                                    item.calibrationId
                                                )
                                            }
                                            style={{
                                                marginLeft: "5px"
                                            }}
                                        >
                                            Delete
                                        </button>

                                    </td>

                                )}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default CalibrationCertification;