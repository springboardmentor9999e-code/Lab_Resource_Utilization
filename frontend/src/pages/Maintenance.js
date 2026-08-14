import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Maintenance() {

    const role = localStorage.getItem("role");

    const [maintenanceList, setMaintenanceList] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);

    const [maintenance, setMaintenance] = useState({
        maintenanceId: "",
        equipmentId: "",
        maintenanceType: "",
        scheduledDate: "",
        description: "",
        status: "SCHEDULED"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

        try {

            const maintenanceRes =
                await api.get("/maintenance");

            const equipmentRes =
                await api.get("/equipment");

            setMaintenanceList(maintenanceRes.data);
            setEquipmentList(equipmentRes.data);

        } catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setMaintenance({
            ...maintenance,
            [e.target.name]: e.target.value
        });

    };

    const clearForm = () => {

        setMaintenance({
            maintenanceId: "",
            equipmentId: "",
            maintenanceType: "",
            scheduledDate: "",
            description: "",
            status: "SCHEDULED"
        });

        setEditing(false);

    };

    const saveMaintenance = async () => {

        try {

            if (!maintenance.equipmentId) {
                alert("Please select equipment.");
                return;
            }

            if (!maintenance.maintenanceType) {
                alert("Please select maintenance type.");
                return;
            }

            if (!maintenance.scheduledDate) {
                alert("Please select scheduled date.");
                return;
            }

            if (editing) {

                await api.put(
                    `/maintenance/${maintenance.maintenanceId}`,
                    maintenance
                );

                alert("Maintenance updated successfully.");

            } else {

                await api.post(
                    "/maintenance",
                    maintenance
                );

                alert("Maintenance scheduled successfully.");

            }

            fetchData();
            clearForm();
            setShowForm(false);

        } catch (error) {

            console.log(error);

            alert("Failed to save maintenance record.");

        }

    };

    const editMaintenance = (item) => {

        setMaintenance({
            maintenanceId: item.maintenanceId,
            equipmentId: item.equipmentId,
            maintenanceType: item.maintenanceType,
            scheduledDate: item.scheduledDate || "",
            description: item.description || "",
            status: item.status || "SCHEDULED"
        });

        setEditing(true);
        setShowForm(true);

    };

    const deleteMaintenance = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this maintenance record?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await api.delete(`/maintenance/${id}`);

            alert("Maintenance record deleted.");

            fetchData();

        } catch (error) {

            console.log(error);

            alert("Failed to delete maintenance record.");

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

                <h1>Maintenance Management</h1>

                <hr />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}
                >

                    <h2>Maintenance Records</h2>

                    {(role === "SYSTEM_ADMIN" ||
                      role === "LAB_MANAGER" ||
                      role === "LAB_TECHNICIAN") && (

                        <button
                            onClick={() => {

                                clearForm();
                                setShowForm(true);

                            }}
                        >
                            + Schedule Maintenance
                        </button>

                    )}

                </div>

                {showForm && (

                    <div
                        style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            borderRadius: "10px",
                            marginBottom: "25px"
                        }}
                    >

                        <h3>
                            {editing
                                ? "Edit Maintenance"
                                : "Schedule Maintenance"}
                        </h3>

                        <label>Equipment</label>

                        <br />

                        <select
                            name="equipmentId"
                            value={maintenance.equipmentId}
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

                        <label>Maintenance Type</label>

                        <br />

                        <select
                            name="maintenanceType"
                            value={maintenance.maintenanceType}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Type
                            </option>

                            <option value="PREVENTIVE">
                                Preventive
                            </option>

                            <option value="CORRECTIVE">
                                Corrective
                            </option>

                            <option value="CALIBRATION">
                                Calibration
                            </option>

                        </select>

                        <br />
                        <br />

                        <label>Scheduled Date</label>

                        <br />

                        <input
                            type="date"
                            name="scheduledDate"
                            value={maintenance.scheduledDate}
                            onChange={handleChange}
                        />

                        <br />
                        <br />

                        <label>Description</label>

                        <br />

                        <textarea
                            name="description"
                            value={maintenance.description}
                            onChange={handleChange}
                            rows="3"
                            cols="40"
                            placeholder="Enter maintenance description"
                        />

                        <br />
                        <br />

                        <label>Status</label>

                        <br />

                        <select
                            name="status"
                            value={maintenance.status}
                            onChange={handleChange}
                        >

                            <option value="SCHEDULED">
                                SCHEDULED
                            </option>

                            <option value="IN_PROGRESS">
                                IN_PROGRESS
                            </option>

                            <option value="COMPLETED">
                                COMPLETED
                            </option>

                        </select>

                        <br />
                        <br />

                        <button onClick={saveMaintenance}>
                            {editing
                                ? "Update Maintenance"
                                : "Save Maintenance"}
                        </button>

                        {" "}

                        <button
                            onClick={() => {

                                clearForm();
                                setShowForm(false);

                            }}
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

                            <th>Maintenance Type</th>

                            <th>Scheduled Date</th>

                            <th>Description</th>

                            <th>Status</th>

                            {(role === "SYSTEM_ADMIN" ||
                              role === "LAB_MANAGER" ||
                              role === "LAB_TECHNICIAN") && (

                                <th>Action</th>

                            )}

                        </tr>

                    </thead>

                    <tbody>

                        {maintenanceList.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    style={{
                                        textAlign: "center"
                                    }}
                                >
                                    No maintenance records found.
                                </td>

                            </tr>

                        ) : (

                            maintenanceList.map((item) => (

                                <tr key={item.maintenanceId}>

                                    <td>
                                        {item.maintenanceId}
                                    </td>

                                    <td>
                                        {getEquipmentName(
                                            item.equipmentId
                                        )}
                                    </td>

                                    <td>
                                        {item.maintenanceType}
                                    </td>

                                    <td>
                                        {item.scheduledDate}
                                    </td>

                                    <td>
                                        {item.description}
                                    </td>

                                    <td>

                                        <span
                                            style={{
                                                backgroundColor:
                                                    item.status === "COMPLETED"
                                                        ? "green"
                                                        : item.status === "IN_PROGRESS"
                                                        ? "blue"
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

                                    {(role === "SYSTEM_ADMIN" ||
                                      role === "LAB_MANAGER" ||
                                      role === "LAB_TECHNICIAN") && (

                                        <td>

                                            <button
                                                onClick={() =>
                                                    editMaintenance(item)
                                                }
                                            >
                                                Edit
                                            </button>

                                            {" "}

                                            <button
                                                onClick={() =>
                                                    deleteMaintenance(
                                                        item.maintenanceId
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    )}

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default Maintenance;