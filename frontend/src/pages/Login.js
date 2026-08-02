import "./Login.css";
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            console.log(response.data);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("fullName", response.data.fullName);
            localStorage.setItem("role", response.data.role);

            alert("Login Successful!");

            navigate("/dashboard");
        } catch (error) {
            console.log(error);

            alert("Invalid Email or Password");
        }
    };

    return (
        <div className="login-container">

            <h1 className="project-title">
                Lab Resource Utilization Platform
            </h1>

            <div className="login-card">

                <h2>Login</h2>

                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() =>
                                setShowPassword(!showPassword)
                            }
                        />
                        Show Password
                    </label>
                </div>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() =>
                                setRememberMe(!rememberMe)
                            }
                        />
                        Remember Me
                    </label>
                </div>

                <button
                    className="login-btn"
                    onClick={handleLogin}
                >
                    Login
                </button>

                <div className="register-section">

                    <p>Don't have an account?</p>

                    <button
                        className="register-btn"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;