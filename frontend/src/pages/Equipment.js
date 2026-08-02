import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Equipment() {

    const [equipmentList, setEquipmentList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [institutions, setInstitutions] = useState([]);

    const [equipment, setEquipment] = useState({
        equipmentName: "",
        categoryId: "",
        departmentId: "",
        institutionId: "",
        manufacturer: "",
        modelNumber: "",
        serialNumber: "",
        status: "",
        purchaseDate: ""
    });

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {

            const equipmentRes = await api.get("/equipment");
            const categoryRes = await api.get("/category");
            const departmentRes = await api.get("/department");
            const institutionRes = await api.get("/institution");

            setEquipmentList(equipmentRes.data);
            setCategories(categoryRes.data);
            setDepartments(departmentRes.data);
            setInstitutions(institutionRes.data);

        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        setEquipment({
            ...equipment,
            [e.target.name]: e.target.value
        });
    };

    const editEquipment = (item) => {

        setEquipment({
            equipmentName: item.equipmentName,
            categoryId: item.categoryId,
            departmentId: item.departmentId,
            institutionId: item.institutionId,
            manufacturer: item.manufacturer,
            modelNumber: item.modelNumber,
            serialNumber: item.serialNumber,
            status: item.status,
            purchaseDate: item.purchaseDate
        });

        setEditing(true);
        setEditingId(item.equipmentId);
        setShowForm(true);
    };

    const clearForm = () => {

        setEquipment({
            equipmentName: "",
            categoryId: "",
            departmentId: "",
            institutionId: "",
            manufacturer: "",
            modelNumber: "",
            serialNumber: "",
            status: "",
            purchaseDate: ""
        });

        setEditing(false);
        setEditingId(null);
    };

    const saveEquipment = async () => {

        try {

            if (editing) {

                await api.put(`/equipment/${editingId}`, equipment);
                alert("Equipment Updated Successfully");

            } else {

                await api.post("/equipment", equipment);
                alert("Equipment Added Successfully");

            }

            fetchData();
            clearForm();
            setShowForm(false);

        } catch (error) {

            console.log(error);
            alert("Operation Failed");

        }
    };

    const deleteEquipment = async (id) => {

        if (!window.confirm("Delete this equipment?"))
            return;

        try {

            await api.delete(`/equipment/${id}`);

            alert("Deleted Successfully");

            fetchData();

        } catch (error) {

            console.log(error);

            alert("Delete Failed");

        }
    };
    return (
    <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "30px" }}>

            <h1>Equipment Management</h1>
            <hr />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px"
                }}
            >
                <h2>Equipment List</h2>

                <button
                    onClick={() => {
                        clearForm();
                        setShowForm(true);
                    }}
                >
                    + Add Equipment
                </button>
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
                        {editing ? "Edit Equipment" : "Add Equipment"}
                    </h3>

                    <input
                        type="text"
                        name="equipmentName"
                        placeholder="Equipment Name"
                        value={equipment.equipmentName}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <select
                        name="categoryId"
                        value={equipment.categoryId}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                            <option
                                key={category.categoryId}
                                value={category.categoryId}
                            >
                                {category.categoryName}
                            </option>
                        ))}
                    </select>

                    <br /><br />

                    <select
                        name="departmentId"
                        value={equipment.departmentId}
                        onChange={handleChange}
                    >
                        <option value="">Select Department</option>

                        {departments.map((department) => (
                            <option
                                key={department.departmentId}
                                value={department.departmentId}
                            >
                                {department.departmentName}
                            </option>
                        ))}
                    </select>

                    <br /><br />

                    <select
                        name="institutionId"
                        value={equipment.institutionId}
                        onChange={handleChange}
                    >
                        <option value="">Select Institution</option>

                        {institutions.map((institution) => (
                            <option
                                key={institution.institutionId}
                                value={institution.institutionId}
                            >
                                {institution.institutionName}
                            </option>
                        ))}
                    </select>

                    <br /><br />

                    <input
                        type="text"
                        name="manufacturer"
                        placeholder="Manufacturer"
                        value={equipment.manufacturer}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <input
                        type="text"
                        name="modelNumber"
                        placeholder="Model Number"
                        value={equipment.modelNumber}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <input
                        type="text"
                        name="serialNumber"
                        placeholder="Serial Number"
                        value={equipment.serialNumber}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <select
                        name="status"
                        value={equipment.status}
                        onChange={handleChange}
                    >
                        <option value="">Select Status</option>
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="IN_USE">IN USE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>

                    <br /><br />

                    <input
                        type="date"
                        name="purchaseDate"
                        value={equipment.purchaseDate}
                        onChange={handleChange}
                    />

                    <br /><br />

                    <button onClick={saveEquipment}>
                        {editing ? "Update Equipment" : "Save Equipment"}
                    </button>

                </div>
            )}

            <table border="1" cellPadding="10" width="100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Department</th>
                        <th>Institution</th>
                        <th>Manufacturer</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>

                    {equipmentList.map((item) => (

                        <tr key={item.equipmentId}>

                            <td>{item.equipmentId}</td>

                            <td>{item.equipmentName}</td>

                            <td>
                                {
                                    categories.find(
                                        c => c.categoryId === item.categoryId
                                    )?.categoryName || "-"
                                }
                            </td>

                            <td>
                                {
                                    departments.find(
                                        d => d.departmentId === item.departmentId
                                    )?.departmentName || "-"
                                }
                            </td>

                            <td>
                                {
                                    institutions.find(
                                        i => i.institutionId === item.institutionId
                                    )?.institutionName || "-"
                                }
                            </td>

                            <td>{item.manufacturer}</td>

                            <td>

                               <span
    style={{
        backgroundColor:
            item.status?.toUpperCase() === "AVAILABLE"
                ? "green"
                : item.status?.toUpperCase() === "IN_USE"
                ? "orange"
                : item.status?.toUpperCase() === "MAINTENANCE"
                ? "red"
                : "gray",
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

                                <button
                                    onClick={() => editEquipment(item)}
                                >
                                    Edit
                                </button>

                                &nbsp;

                                <button
                                    onClick={() =>
                                        deleteEquipment(item.equipmentId)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    </div>
);
}
export default Equipment;