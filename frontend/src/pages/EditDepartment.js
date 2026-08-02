import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/Management.css";

function EditDepartment() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [institutionList, setInstitutionList] = useState([]);

    const [department, setDepartment] = useState({
        departmentName: "",
        institution: {
            institutionId: ""
        }
    });

    useEffect(() => {

        fetchInstitutions();

        fetchDepartment();

    }, []);

    const fetchInstitutions = async () => {

        try {

            const response = await api.get("/institution");

            setInstitutionList(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const fetchDepartment = async () => {

        try {

            const response = await api.get(`/department/${id}`);

            setDepartment({
                departmentName: response.data.departmentName,
                institution: {
                    institutionId:
                        response.data.institution.institutionId
                }
            });

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

    const updateDepartment = async () => {

        try {

            await api.put(`/department/${id}`, department);

            alert("Department Updated Successfully");

            navigate("/department");

        } catch (error) {

            console.log(error);

            alert("Unable to Update Department");

        }

    };

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div className="page-container">

                <h1 className="page-title">

                    Edit Department

                </h1>

                <hr />

                <div className="form-card">

                    <input
                        type="text"
                        name="departmentName"
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
                            onClick={updateDepartment}
                        >
                            Update
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

export default EditDepartment;