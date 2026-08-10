import React, { useEffect, useState } from "react";
import axios from "axios";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
import "../styles/maintenance.css";

function Maintenance() {

    const [maintenance, setMaintenance] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        resourceId: "",
        maintenanceDate: "",
        description: "",
        status: "",
        maintenanceType: "",
        cost: "",
        vendor: "",
        startDate: "",
        endDate: "",
        nextDueDate: ""
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadMaintenance();
    }, []);

    const loadMaintenance = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/maintenance"
            );
            setMaintenance(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const saveMaintenance = async () => {

        try {

            if (editingId === null) {

                await axios.post(
                    "http://localhost:8080/api/maintenance",
                    form
                );

                alert("Maintenance Added Successfully");

            } else {

                await axios.put(
                    `http://localhost:8080/api/maintenance/${editingId}`,
                    form
                );

                alert("Maintenance Updated Successfully");
            }

            resetForm();

            loadMaintenance();

        } catch (error) {

            console.error(error);
            alert("Operation Failed");

        }

    };

    const editMaintenance = (item) => {

        setEditingId(item.maintenanceId);

        setForm({

            resourceId: item.resourceId || "",
            maintenanceDate: item.maintenanceDate || "",
            description: item.description || "",
            status: item.status || "",
            maintenanceType: item.maintenanceType || "",
            cost: item.cost || "",
            vendor: item.vendor || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            nextDueDate: item.nextDueDate || ""

        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

    const deleteMaintenance = async (id) => {

        if (!window.confirm("Delete this maintenance record?")) {
            return;
        }

        try {

            await axios.delete(
                "http://localhost:8080/api/maintenance/" + id
            );

            alert("Maintenance Deleted Successfully");

            loadMaintenance();

        } catch (error) {

            console.error(error);
            alert("Delete Failed");

        }

    };

    return (

        <>
            {/*<Sidebar />*/}



                {/*<Navbar />*/}

                <div className="maintenance-page">

                    <h2>Maintenance Management</h2>

                    <div className="maintenance-form">

                        <input
                            type="number"
                            name="resourceId"
                            placeholder="Resource ID"
                            value={form.resourceId}
                            onChange={handleChange}
                        />

                        <input
                            type="date"
                            name="maintenanceDate"
                            value={form.maintenanceDate}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="maintenanceType"
                            placeholder="Maintenance Type"
                            value={form.maintenanceType}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="vendor"
                            placeholder="Vendor"
                            value={form.vendor}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            name="cost"
                            placeholder="Cost"
                            value={form.cost}
                            onChange={handleChange}
                        />

                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                        />

                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                        />

                        <input
                            type="date"
                            name="nextDueDate"
                            value={form.nextDueDate}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="status"
                            placeholder="Status"
                            value={form.status}
                            onChange={handleChange}
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                        />

                        <button
                            className="save-btn"
                            onClick={saveMaintenance}
                        >
                            {editingId === null
                                ? "Save Maintenance"
                                : "Update Maintenance"}
                        </button>

                        {editingId !== null && (
                            <button
                                className="btn btn-secondary ms-2"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                    <br />

                    <table className="table table-bordered">

                        <thead>

                        <tr>

                            <th>ID</th>
                            <th>Resource</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Vendor</th>
                            <th>Cost</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Next Due</th>
                            <th>Description</th>
                            <th>Action</th>

                        </tr>

                        </thead>

                        <tbody>
                        {maintenance.map((item) => (

                            <tr key={item.maintenanceId}>

                                <td>{item.maintenanceId}</td>
                                <td>{item.resourceId}</td>
                                <td>{item.maintenanceDate}</td>
                                <td>{item.maintenanceType}</td>
                                <td>{item.status}</td>
                                <td>{item.vendor}</td>
                                <td>{item.cost}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>{item.nextDueDate}</td>
                                <td>{item.description}</td>

                                <td>

                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => editMaintenance(item)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteMaintenance(item.maintenanceId)}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>




        </>

    );

}

export default Maintenance;