import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/Management.css";
function Department() {

    const role = (localStorage.getItem("role") || "")
    .trim()
    .toUpperCase();

console.log("Current Role:", role);
    const [departmentList, setDepartmentList] = useState([]);

    const [institutionList, setInstitutionList] = useState([]);

    const [department, setDepartment] = useState({
        departmentName: "",
        institution: {
            institutionId: ""
        }
    });

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {

        fetchDepartments();

        fetchInstitutions();

    }, []);

    const fetchDepartments = async () => {

        try {

            const response = await api.get("/department");

            setDepartmentList(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const fetchInstitutions = async () => {

        try {

            const response = await api.get("/institution");

            setInstitutionList(response.data);

        } catch (error) {

            console.log(error);

        }

    };
    const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "institutionId") {

        setDepartment({
            ...department,
            institution: {
                institutionId: value
            }
        });

    } else {

        setDepartment({
            ...department,
            [name]: value
        });

    }

};

const saveDepartment = async () => {

    try {

        if (editingId) {

            await api.put(`/department/${editingId}`, department);

            alert("Department Updated Successfully");

        } else {

            await api.post("/department", department);

            alert("Department Added Successfully");

        }

        setShowForm(false);

        setEditingId(null);

        setDepartment({
            departmentName: "",
            institution: {
                institutionId: ""
            }
        });

        fetchDepartments();

    } catch (error) {

        console.log(error);

        alert("Unable to Save Department");

    }

};
const editDepartment = (item) => {

    setEditingId(item.departmentId);

    setDepartment({
        departmentName: item.departmentName,
        institution: {
            institutionId: item.institution.institutionId
        }
    });

    setShowForm(true);

};

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div className="page-container">

                <h1 className="page-title">
    Department Management
</h1>

                <hr />

                <div className="page-header">

                    <h2>Department List</h2>

                    {role !== "DEPARTMENT_HEAD" && (
    <button
        className="add-btn"
        onClick={() => setShowForm(true)}
    >
        + Add Department
    </button>
)}

                {showForm && role !== "DEPARTMENT_HEAD" && (

    <div className="form-card">

        <input
            type="text"
            name="departmentName"
            placeholder="Department Name"
            value={department.departmentName}
            onChange={handleChange}
        />

        <br /><br />

        <select
            name="institutionId"
            value={department.institution.institutionId}
            onChange={handleChange}
        >

            <option value="">Select Institution</option>

            {institutionList.map((item) => (

                <option
                    key={item.institutionId}
                    value={item.institutionId}
                >
                    {item.institutionName}
                </option>

            ))}

        </select>

        <br /><br />

        <button
    className="save-btn"
    onClick={saveDepartment}
>
            {editingId ? "Update" : "Save"}
        </button>

    </div>

)}
<table
    className="management-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Department Name</th>
            <th>Institution</th>
            {role !== "DEPARTMENT_HEAD" && (
    <th>Action</th>
)}
        </tr>
    </thead>

    <tbody>

        {departmentList.map((item) => (

            <tr key={item.departmentId}>

                <td>{item.departmentId}</td>

                <td>{item.departmentName}</td>

                <td>{item.institution.institutionName}</td>
                {role !== "DEPARTMENT_HEAD" && (
                <td>

                    <button
    className="edit-btn"
    onClick={() => editDepartment(item)}
>
                    </button>

                </td>
                )}

            </tr>

        ))}

    </tbody>

</table>
                </div>

            </div>

        </div>

    );

}

export default Department;