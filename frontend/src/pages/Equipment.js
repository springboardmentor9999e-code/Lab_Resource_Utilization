import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

import Delldesktop from "../images/Delldesktop.jpg";
import DellOptiPlex from "../images/DellOptiPlex.jpg";
import HpProdesk from "../images/Hp Prodesk.jpg";
import Motherboard from "../images/Motherboard.jpg";
import Workstation from "../images/Workstation.jpg";
import CanonimageClass from "../images/CanonImageClass.jpg";
import CiscoCatalystSwitch from "../images/Cisco Catalyst Switch.jpg";
import EpsonEcoTank from "../images/Epson EcoTank.jpg";
import BenQ from "../images/BenQ.jpg";
import Epson from "../images/Epson.jpg";
import TplinkRouter from "../images/Tp Link Router.jpg";
import BrotherScanner from "../images/Brother Scanner.jpg";
import EpsonPerfection from "../images/Epson Perfection.jpg";
import Dellkeyboard from "../images/Dell Keyboard.jpg";

function Equipment() {

    const role = localStorage.getItem("role");

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
        purchaseDate: "",
        costPerHour: ""
    });

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [showDetails, setShowDetails] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const recordsPerPage = 7;


    // ============================================================
    // FETCH DATA
    // ============================================================

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {

        try {

            const equipmentRes =
                await api.get("/equipment");

            const categoryRes =
                await api.get("/category");

            const departmentRes =
                await api.get("/department");


            setEquipmentList(equipmentRes.data);

            setCategories(categoryRes.data);

            setDepartments(departmentRes.data);


            // SYSTEM_ADMIN and INSTITUTION_ADMIN
            // can load institutions
            if (
                role === "SYSTEM_ADMIN" ||
                role === "INSTITUTION_ADMIN"
            ) {

                const institutionRes =
                    await api.get("/institution");

                setInstitutions(institutionRes.data);

            } else {

                setInstitutions([]);

            }

        } catch (error) {

            console.log(
                "Equipment fetch error:",
                error
            );

        }
    };


    // ============================================================
    // HANDLE FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        setEquipment({
            ...equipment,
            [e.target.name]: e.target.value
        });

    };


    // ============================================================
    // EDIT EQUIPMENT
    // ============================================================

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

            purchaseDate: item.purchaseDate,

            costPerHour: item.costPerHour

        });

        setEditing(true);

        setEditingId(item.equipmentId);

        setShowForm(true);
    };


    // ============================================================
    // EQUIPMENT IMAGES
    // ============================================================

    const equipmentImages = {

        "Dell Desktop": Delldesktop,

        "Dell OptiPlex": DellOptiPlex,

        "HP ProDesk": HpProdesk,

        "Motherboard": Motherboard,

        "Workstation": Workstation,

        "Canon imageClass": CanonimageClass,

        "Epson Ecotank": EpsonEcoTank,

        "BenQ": BenQ,

        "EPSON": Epson,

        "Cisco catalyst Switch": CiscoCatalystSwitch,

        "Tp-Link Router": TplinkRouter,

        "Brother Scanner": BrotherScanner,

        "Epson Perfection": EpsonPerfection,

        "Dell Keyboard": Dellkeyboard
    };


    // ============================================================
    // CLEAR FORM
    // ============================================================

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

            purchaseDate: "",

            costPerHour: ""

        });

        setEditing(false);

        setEditingId(null);
    };


    // ============================================================
    // SAVE EQUIPMENT
    // ============================================================

    const saveEquipment = async () => {

        try {

            if (editing) {

                await api.put(
                    `/equipment/${editingId}`,
                    equipment
                );

                alert(
                    "Equipment Updated Successfully"
                );

            } else {

                await api.post(
                    "/equipment",
                    equipment
                );

                alert(
                    "Equipment Added Successfully"
                );
            }


            setEditing(false);

            setShowForm(false);

            clearForm();

            fetchData();

        } catch (error) {

            console.log(error);

            alert(
                "Operation Failed"
            );
        }
    };


    // ============================================================
    // DELETE EQUIPMENT
    // ============================================================

    const deleteEquipment = async (id) => {

        if (
            !window.confirm(
                "Delete this equipment?"
            )
        ) {
            return;
        }

        try {

            await api.delete(
                `/equipment/${id}`
            );

            alert(
                "Deleted Successfully"
            );

            fetchData();

        } catch (error) {

            console.log(error);

            alert(
                "Delete Failed"
            );
        }
    };


    // ============================================================
    // PAGINATION
    // ============================================================

    const lastIndex =
        currentPage * recordsPerPage;

    const firstIndex =
        lastIndex - recordsPerPage;

    const currentEquipments =
        equipmentList.slice(
            firstIndex,
            lastIndex
        );

    const totalPages =
        Math.ceil(
            equipmentList.length /
            recordsPerPage
        );


    // ============================================================
    // UI
    // ============================================================

    return (

        <div
            style={{
                display: "flex"
            }}
        >

            <Sidebar />


            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>
                    Equipment Management
                </h1>

                <hr />


                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                    }}
                >

                    <h2>
                        Equipment List
                    </h2>


                    {/* ADD EQUIPMENT */}

                    {(
                        role === "SYSTEM_ADMIN" ||
                        role === "INSTITUTION_ADMIN" ||
                        role === "DEPARTMENT_HEAD"
                    ) && (

                        <button
                            onClick={() => {

                                clearForm();

                                setShowForm(true);

                            }}
                        >
                            + Add Equipment
                        </button>

                    )}

                </div>


                {/* ==================================================
                    ADD / EDIT FORM
                ================================================== */}

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
                                ? "Edit Equipment"
                                : "Add Equipment"
                            }

                        </h3>


                        <input
                            type="text"
                            name="equipmentName"
                            placeholder="Equipment Name"
                            value={
                                equipment.equipmentName
                            }
                            onChange={handleChange}
                        />

                        <br />
                        <br />


                        {/* CATEGORY */}

                        <select
                            name="categoryId"
                            value={
                                equipment.categoryId
                            }
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Category
                            </option>


                            {categories.map(
                                (category) => (

                                    <option
                                        key={
                                            category.categoryId
                                        }
                                        value={
                                            category.categoryId
                                        }
                                    >

                                        {
                                            category.categoryName
                                        }

                                    </option>

                                )
                            )}

                        </select>


                        <br />
                        <br />


                        {/* DEPARTMENT */}

                        {role !== "DEPARTMENT_HEAD" && (

                            <>

                                <select
                                    name="departmentId"
                                    value={
                                        equipment.departmentId
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select Department
                                    </option>


                                    {departments.map(
                                        (department) => (

                                            <option
                                                key={
                                                    department.departmentId
                                                }
                                                value={
                                                    department.departmentId
                                                }
                                            >

                                                {
                                                    department.departmentName
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                <br />
                                <br />

                            </>

                        )}


                        {/* INSTITUTION */}

                        {role !== "DEPARTMENT_HEAD" && (

                            <>

                                <select
                                    name="institutionId"
                                    value={
                                        equipment.institutionId
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select Institution
                                    </option>


                                    {institutions.map(
                                        (institution) => (

                                            <option
                                                key={
                                                    institution.institutionId
                                                }
                                                value={
                                                    institution.institutionId
                                                }
                                            >

                                                {
                                                    institution.institutionName
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                <br />
                                <br />

                            </>

                        )}


                        {/* MANUFACTURER */}

                        <input
                            type="text"
                            name="manufacturer"
                            placeholder="Manufacturer"
                            value={
                                equipment.manufacturer
                            }
                            onChange={handleChange}
                        />

                        <br />
                        <br />


                        {/* MODEL */}

                        <input
                            type="text"
                            name="modelNumber"
                            placeholder="Model Number"
                            value={
                                equipment.modelNumber
                            }
                            onChange={handleChange}
                        />

                        <br />
                        <br />


                        {/* SERIAL */}

                        <input
                            type="text"
                            name="serialNumber"
                            placeholder="Serial Number"
                            value={
                                equipment.serialNumber
                            }
                            onChange={handleChange}
                        />

                        <br />
                        <br />


                        {/* COST */}

                        <input
                            type="number"
                            name="costPerHour"
                            placeholder="Cost Per Hour (₹)"
                            value={
                                equipment.costPerHour
                            }
                            onChange={handleChange}
                        />

                        <br />
                        <br />


                        {/* STATUS */}

                        <select
                            name="status"
                            value={
                                equipment.status
                            }
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Status
                            </option>

                            <option value="AVAILABLE">
                                AVAILABLE
                            </option>

                            <option value="IN_USE">
                                IN USE
                            </option>

                            <option value="MAINTENANCE">
                                MAINTENANCE
                            </option>

                        </select>


                        <br />
                        <br />


                        {/* PURCHASE DATE */}

                        <input
                            type="date"
                            name="purchaseDate"
                            value={
                                equipment.purchaseDate
                            }
                            onChange={handleChange}
                        />

                        <br />
                        <br />


                        <button
                            onClick={
                                saveEquipment
                            }
                        >

                            {editing
                                ? "Update Equipment"
                                : "Save Equipment"
                            }

                        </button>


                        &nbsp;


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


                {/* ==================================================
                    EQUIPMENT TABLE
                ================================================== */}

                <table
                    border="1"
                    cellPadding="10"
                    width="100%"
                >

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

                        {currentEquipments.map(
                            (item) => (

                                <tr
                                    key={
                                        item.equipmentId
                                    }
                                >

                                    <td>
                                        {
                                            item.equipmentId
                                        }
                                    </td>


                                    <td>
                                        {
                                            item.equipmentName
                                        }
                                    </td>


                                    <td>

                                        {
                                            categories.find(
                                                c =>
                                                    c.categoryId ===
                                                    item.categoryId
                                            )?.categoryName
                                            || "-"
                                        }

                                    </td>


                                    <td>

                                        {
                                            departments.find(
                                                d =>
                                                    d.departmentId ===
                                                    item.departmentId
                                            )?.departmentName
                                            || "-"
                                        }

                                    </td>


                                    <td>

                                        {item.institutionName ||

                                            institutions.find(
                                                i =>
                                                    i.institutionId ===
                                                    item.institutionId
                                            )?.institutionName

                                            || "-"
                                        }

                                    </td>


                                    <td>
                                        {
                                            item.manufacturer
                                        }
                                    </td>


                                    <td>

                                        <span
                                            style={{
                                                backgroundColor:

                                                    item.status?.toUpperCase() ===
                                                    "AVAILABLE"

                                                        ? "green"

                                                        : item.status?.toUpperCase() ===
                                                          "IN_USE"

                                                            ? "orange"

                                                            : item.status?.toUpperCase() ===
                                                              "MAINTENANCE"

                                                                ? "red"

                                                                : "gray",

                                                color: "white",

                                                padding: "5px 10px",

                                                borderRadius: "8px",

                                                fontWeight: "bold"
                                            }}
                                        >

                                            {
                                                item.status
                                            }

                                        </span>

                                    </td>


                                    <td>

                                        {/* EDIT */}

                                        {(
                                            role === "SYSTEM_ADMIN" ||
                                            role === "INSTITUTION_ADMIN" ||
                                            role === "DEPARTMENT_HEAD"
                                        ) && (

                                            <>

                                                <button
                                                    onClick={() =>
                                                        editEquipment(
                                                            item
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                &nbsp;

                                                <button
                                                    onClick={() =>
                                                        deleteEquipment(
                                                            item.equipmentId
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                                &nbsp;

                                            </>

                                        )}


                                        {/* VIEW DETAILS */}

                                        <button
                                            onClick={() => {

                                                setSelectedEquipment(
                                                    item
                                                );

                                                setShowDetails(
                                                    true
                                                );

                                            }}
                                        >

                                            View Details

                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>


                {/* ==================================================
                    PAGINATION
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                        gap: "10px"
                    }}
                >

                    <button
                        disabled={
                            currentPage === 1
                        }
                        onClick={() =>
                            setCurrentPage(
                                currentPage - 1
                            )
                        }
                    >
                        Previous
                    </button>


                    {[
                        ...Array(
                            totalPages
                        )
                    ].map(
                        (_, index) => (

                            <button
                                key={index}
                                onClick={() =>
                                    setCurrentPage(
                                        index + 1
                                    )
                                }
                                style={{
                                    fontWeight:
                                        currentPage ===
                                        index + 1
                                            ? "bold"
                                            : "normal"
                                }}
                            >

                                {index + 1}

                            </button>

                        )
                    )}


                    <button
                        disabled={
                            currentPage ===
                            totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                currentPage + 1
                            )
                        }
                    >
                        Next
                    </button>

                </div>


                {/* ==================================================
                    DETAILS POPUP
                ================================================== */}

                {showDetails &&
                    selectedEquipment && (

                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor:
                                    "rgba(0,0,0,0.5)",
                                display: "flex",
                                justifyContent:
                                    "center",
                                alignItems:
                                    "center",
                                zIndex: 999
                            }}
                        >

                            <div
                                style={{
                                    backgroundColor:
                                        "white",
                                    width: "500px",
                                    padding: "25px",
                                    borderRadius:
                                        "10px"
                                }}
                            >

                                <h2>
                                    Equipment Details
                                </h2>


                                <img
                                    src={
                                        equipmentImages[
                                            selectedEquipment
                                                .equipmentName
                                        ]
                                    }
                                    alt={
                                        selectedEquipment
                                            .equipmentName
                                    }
                                    style={{
                                        width: "220px",
                                        height: "170px",
                                        objectFit: "cover",
                                        borderRadius:
                                            "8px",
                                        display:
                                            "block",
                                        margin:
                                            "15px auto"
                                    }}
                                />


                                <p>
                                    <b>Name:</b>{" "}
                                    {
                                        selectedEquipment
                                            .equipmentName
                                    }
                                </p>


                                <p>
                                    <b>Category:</b>{" "}

                                    {
                                        categories.find(
                                            c =>
                                                c.categoryId ===
                                                selectedEquipment
                                                    .categoryId
                                        )?.categoryName
                                        || "-"
                                    }

                                </p>


                                <p>
                                    <b>Department:</b>{" "}

                                    {
                                        departments.find(
                                            d =>
                                                d.departmentId ===
                                                selectedEquipment
                                                    .departmentId
                                        )?.departmentName
                                        || "-"
                                    }

                                </p>


                                <p>
                                    <b>Institution:</b>{" "}

                                   {selectedEquipment.institutionName || "-"}

                                </p>


                                <p>
                                    <b>Manufacturer:</b>{" "}
                                    {
                                        selectedEquipment
                                            .manufacturer
                                    }
                                </p>


                                <p>
                                    <b>Model Number:</b>{" "}
                                    {
                                        selectedEquipment
                                            .modelNumber
                                    }
                                </p>


                                <p>
                                    <b>Serial Number:</b>{" "}
                                    {
                                        selectedEquipment
                                            .serialNumber
                                    }
                                </p>


                                <p>
                                    <b>Status:</b>{" "}
                                    {
                                        selectedEquipment
                                            .status
                                    }
                                </p>


                                <p>
                                    <b>Purchase Date:</b>{" "}
                                    {
                                        selectedEquipment
                                            .purchaseDate
                                    }
                                </p>


                                <p>
                                    <b>Cost Per Hour:</b>{" "}
                                    ₹{
                                        selectedEquipment
                                            .costPerHour
                                    }
                                </p>


                                <button
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    )}

            </div>

        </div>

    );
}

export default Equipment;