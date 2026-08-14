import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/Management.css";

function DepartmentList() {

    const role = (localStorage.getItem("role") || "")
        .trim()
        .toUpperCase();

    console.log("DepartmentList Role:", role);

    const [departmentList, setDepartmentList] =
        useState([]);

    const navigate = useNavigate();

    const canManageDepartments =
        role === "SYSTEM_ADMIN" ||
        role === "INSTITUTION_ADMIN";


    useEffect(() => {

        fetchDepartments();

    }, []);


    const fetchDepartments = async () => {

        try {

            const response =
                await api.get("/department");

            setDepartmentList(response.data);

        } catch (error) {

            console.log(error);

        }

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

                    <h2>
                        Department List
                    </h2>


                    {/* ================================
                        ADD DEPARTMENT
                    ================================= */}

                    {canManageDepartments && (

                        <button
                            className="add-btn"
                            onClick={() =>
                                navigate(
                                    "/department/add"
                                )
                            }
                        >
                            + Add Department
                        </button>

                    )}

                </div>


                <table className="management-table">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>
                                Department
                            </th>

                            <th>
                                Institution
                            </th>


                            {canManageDepartments && (

                                <th>
                                    Action
                                </th>

                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {departmentList.map(
                            (item) => (

                                <tr
                                    key={
                                        item.departmentId
                                    }
                                >

                                    <td>
                                        {
                                            item.departmentId
                                        }
                                    </td>

                                    <td>
                                        {
                                            item.departmentName
                                        }
                                    </td>

                                    <td>
                                        {
                                            item.institution
                                                ?.institutionName
                                        }
                                    </td>


                                    {canManageDepartments && (

                                        <td>

                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/department/edit/${item.departmentId}`
                                                    )
                                                }
                                            >
                                                ✏ Edit
                                            </button>

                                        </td>

                                    )}

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default DepartmentList;