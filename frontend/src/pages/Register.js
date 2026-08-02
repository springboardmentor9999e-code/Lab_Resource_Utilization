import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("RESEARCHER");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {

        const response = await api.post("/auth/register", {
            firstName,
            lastName,
            email,
            password,
            role
        });

        alert(response.data);

        navigate("/");

    } catch (error) {

        if (error.response) {
            alert(error.response.data);
        } else {
            alert("Registration Failed");
        }

    }
};

    return (
        <div className="login-container">

            <h1 className="project-title">
                Lab Resource Utilization Platform
            </h1>

            <div className="login-card">

                <h2>Create Account</h2>

                <form onSubmit={handleRegister}>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="role-select"
                        >
                            <option value="SYSTEM_ADMIN">System Admin</option>
                            <option value="INSTITUTION_ADMIN">Institution Admin</option>
                            <option value="DEPARTMENT_HEAD">Department Head</option>
                            <option value="LAB_MANAGER">Lab Manager</option>
                            <option value="LAB_TECHNICIAN">Lab Technician</option>
                            <option value="RESEARCHER">Researcher</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            Show Password
                        </label>
                    </div>

                    <button className="login-btn" type="submit">
                        Register
                    </button>

                </form>

                <div className="register-section">
                    <p>Already have an account?</p>

                    <button
                        className="register-btn"
                        onClick={() => navigate("/")}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;