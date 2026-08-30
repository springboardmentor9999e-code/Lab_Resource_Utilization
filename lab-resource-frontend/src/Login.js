import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function Login({ onLogin }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("email", response.data.email);

            alert("Login Successful");

            onLogin(response.data.role);

        } catch (error) {

            console.error(error);

            alert("Invalid Email or Password");

        }

    };

    return (

        <div className="login-page">

            <div className="login-container">

                <div className="login-left-panel">

                    <div className="panel-badge">
                        Enterprise Portal
                    </div>

                    <h1 className="panel-title">
                        Lab Resource Management System
                    </h1>

                    <p className="panel-subtitle">
                        Secure Equipment Booking Platform
                    </p>

                    <ul className="feature-list">

                        <li className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>Manage Laboratory Resources Efficiently</span>
                        </li>

                        <li className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>Real-Time Equipment Availability</span>
                        </li>

                        <li className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>Role Based Secure Access</span>
                        </li>

                        <li className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>Equipment Booking & Tracking</span>
                        </li>

                    </ul>

                </div>

                <div className="login-right-panel">

                    <div className="login-card">

                        <div className="card-header">

                            <h2>Welcome Back</h2>

                            <p>
                                Sign in to continue
                            </p>

                        </div>

                        <div className="input-group">

                            <label>Email Address</label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    📧
                                </span>

                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />

                            </div>

                        </div>
                        <button
                            className="login-btn"
                            onClick={handleLogin}
                        >
                            Sign In
                        </button>

                    </div>

                </div>

            </div>

            <footer className="login-footer">
                © 2026 Lab Resource Management System | Infosys Internship Project
            </footer>

        </div>

    );

}

export default Login;