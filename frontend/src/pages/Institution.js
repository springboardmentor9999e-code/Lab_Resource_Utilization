import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Institution() {

    const [institutionList, setInstitutionList] = useState([]);

    const [institution, setInstitution] = useState({
        institutionName: "",
        address: "",
        email: "",
        phone: ""
    });

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

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

        setInstitution({
            ...institution,
            [e.target.name]: e.target.value
        });

    };

    const editInstitution = (item) => {

        setInstitution({
            institutionName: item.institutionName,
            address: item.address,
            email: item.email,
            phone: item.phone
        });

        setEditingId(item.institutionId);

        setShowForm(true);

    };

    const saveInstitution = async () => {

        try {

            if (editingId) {

                await api.put(
                    `/institution/${editingId}`,
                    institution
                );

                alert("Institution Updated Successfully");

            } else {

                await api.post(
                    "/institution",
                    institution
                );

                alert("Institution Added Successfully");

            }

            setInstitution({
                institutionName: "",
                address: "",
                email: "",
                phone: ""
            });

            setEditingId(null);

            setShowForm(false);

            fetchInstitutions();

        } catch (error) {

            console.log(error);

            alert("Unable to Save Institution");

        }

    };

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div style={{ flex: 1, padding: "30px" }}>

                <h1>Institution Management</h1>

                <hr />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                    }}
                >

                    <h2>Institution List</h2>

                    <button
                        onClick={() => {

                            setShowForm(true);

                            setEditingId(null);

                            setInstitution({
                                institutionName: "",
                                address: "",
                                email: "",
                                phone: ""
                            });

                        }}
                    >
                        + Add Institution
                    </button>

                </div>

                {showForm && (

                    <div
                        style={{
                            border: "1px solid gray",
                            padding: "20px",
                            marginBottom: "20px"
                        }}
                    >

                        <input
                            type="text"
                            name="institutionName"
                            placeholder="Institution Name"
                            value={institution.institutionName}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={institution.address}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={institution.email}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={institution.phone}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <button onClick={saveInstitution}>
                            {editingId ? "Update" : "Save"}
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
                            <th>Name</th>
                            <th>Address</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>
                                            {institutionList.map((item) => (

                            <tr key={item.institutionId}>

                                <td>{item.institutionId}</td>

                                <td>{item.institutionName}</td>

                                <td>{item.address}</td>

                                <td>{item.email}</td>

                                <td>{item.phone}</td>

                                <td>

                                    <button
                                        onClick={() => editInstitution(item)}
                                        style={{
                                            color: "black",
                                            border: "none",
                                            padding: "6px 10px",
                                            borderRadius: "5px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ✏️ Edit
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

export default Institution;