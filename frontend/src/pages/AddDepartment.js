import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/Management.css";

function AddDepartment() {

    const navigate = useNavigate();

    const [institutionList, setInstitutionList] = useState([]);

    const [department, setDepartment] = useState({
        departmentName: "",
        institution: {
            institutionId: ""
        }
    });

    useEffect(() => {
        fetchInstitutions();
    }, []);

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

            await api.post("/department", department);

            alert("Department Added Successfully");

            navigate("/department");

        } catch (error) {

            console.log(error);

            alert("Unable to Save Department");

        }

    };

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div className="page-container">

                <h1 className="page-title">
                    Add Department
                </h1>

                <hr />

                <div className="form-card">

                    <input
                        type="text"
                        name="departmentName"
                        placeholder="Department Name"
                        value={department.departmentName}
                        onChange={handleChange}
                    />

                    <select
                        name="institutionId"
                        value={department.institution.institutionId}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Institution
                        </option>

                        {institutionList.map((item) => (

                            <option
                                key={item.institutionId}
                                value={item.institutionId}
                            >
                                {item.institutionName}
                            </option>

                        ))}

                    </select>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px"
                        }}
                    >

                        <button
                            className="save-btn"
                            onClick={saveDepartment}
                        >
                            Save
                        </button>

                        <button
                            className="edit-btn"
                            onClick={() => navigate("/department")}
                        >
                            Cancel
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AddDepartment;