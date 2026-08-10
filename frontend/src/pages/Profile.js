import React, { useState } from "react";
import "../styles/profile.css";
import "../styles/dashboard.css";

function Profile() {
    const [user, setUser] = useState({
        name: localStorage.getItem("name") || "",
        email: localStorage.getItem("email") || "",
        role: localStorage.getItem("role") || "",
        department: "",
        laboratory: "",
        password: ""
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const updateProfile = () => {
        alert("Profile Updated Successfully");
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>My Account & User Profile</h1>
                <p>View account roles, department permissions, and update user security settings</p>
            </div>

            <div className="chart-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            readOnly
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f1f5f9" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>User Role</label>
                        <input
                            type="text"
                            name="role"
                            value={user.role}
                            readOnly
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f1f5f9" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Department</label>
                        <input
                            type="text"
                            name="department"
                            value={user.department}
                            onChange={handleChange}
                            placeholder="Department"
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Laboratory</label>
                        <input
                            type="text"
                            name="laboratory"
                            value={user.laboratory}
                            onChange={handleChange}
                            placeholder="Laboratory"
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={user.password}
                            onChange={handleChange}
                            placeholder="New Password"
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button onClick={updateProfile} style={{ flex: 1, background: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                            Update Profile
                        </button>
                        <button onClick={logout} style={{ background: "#ef4444", color: "white", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;