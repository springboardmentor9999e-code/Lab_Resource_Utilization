import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        department: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {

        setUser({
            ...user,
            [e.target.name]: e.target.value
        });

    };

    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        try {

            await axios.post(
                "http://localhost:8080/api/auth/register",
                user
            );

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {

                navigate("/");

            }, 1500);

        } catch (error) {

            console.log("Registration Error:", error);

            if (error.response) {
                setError(
                    error.response.data?.message ||
                    error.response.data?.error ||
                    `Error: ${error.response.status}`
                );
            } else {
                setError("Backend server is not running.");
            }

        }

    };


    return (

        <div className="register-page">

            {/* Animated background */}

            <div className="register-background">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

            </div>


            {/* Brand */}

            <header className="register-brand">

                <div className="register-brand-icon">
                    🔬
                </div>

                <div>

                    <h1>
                        Lab Resource
                    </h1>

                    <p>
                        Utilization Platform
                    </p>

                </div>

            </header>


            {/* Main */}

            <main className="register-container">


                {/* Left Section */}

                <section className="register-welcome">

                    <div className="register-science-icon">
                        🧪
                    </div>

                    <h2>
                        Join Our Laboratory
                    </h2>

                    <p>
                        Create your account and access
                        smart laboratory resources.
                    </p>


                    <div className="register-features">

                        <div>
                            🔬
                            <span>
                                Smart Resource Management
                            </span>
                        </div>

                        <div>
                            📅
                            <span>
                                Easy Equipment Booking
                            </span>
                        </div>

                        <div>
                            📊
                            <span>
                                Track Resource Utilization
                            </span>
                        </div>

                    </div>

                </section>


                {/* Register Card */}

                <section className="register-card">


                    <div className="register-card-header">

                        <div className="register-icon">
                            ✨
                        </div>

                        <h2>
                            Create Account
                        </h2>

                        <p>
                            Register to access the laboratory platform
                        </p>

                    </div>


                    {error && (

                        <div className="register-error">
                            {error}
                        </div>

                    )}


                    {success && (

                        <div className="register-success">
                            {success}
                        </div>

                    )}


                    <form
                        onSubmit={handleRegister}
                    >


                        {/* Name */}

                        <div className="register-input-group">

                            <label>
                                Full Name
                            </label>

                            <div className="register-input-wrapper">

                                <span>
                                    👤
                                </span>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={user.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* Email */}

                        <div className="register-input-group">

                            <label>
                                Email Address
                            </label>

                            <div className="register-input-wrapper">

                                <span>
                                    📧
                                </span>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={user.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}

                        <div className="register-input-group">

                            <label>
                                Password
                            </label>

                            <div className="register-input-wrapper">

                                <span>
                                    🔒
                                </span>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={user.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* Role */}

                        <div className="register-input-group">

                            <label>
                                Select Role
                            </label>

                            <div className="register-input-wrapper">

                                <span>
                                    🎓
                                </span>

                                <select
                                    name="role"
                                    value={user.role}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="STUDENT">
                                        Student / Researcher
                                    </option>

                                    <option value="FACULTY">
                                        Faculty
                                    </option>

                                    <option value="LAB_MANAGER">
                                        Lab Technician
                                    </option>
                                    <option value="SYSTEM_ADMINISTRATOR">
                                        System Administrator
                                    </option>
                                    <option value="DEPARTMENT_ADMINISTRATOR">
                                        Department Administrator
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Department */}

                        <div className="register-input-group">

                            <label>
                                Department
                            </label>

                            <div className="register-input-wrapper">

                                <span>
                                    🏢
                                </span>

                                <input
                                    type="text"
                                    name="department"
                                    placeholder="Enter your department"
                                    value={user.department}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="register-button"
                        >

                            Create Account
                            <span>
                                →
                            </span>

                        </button>


                    </form>


                    <div className="login-link-section">

                        <p>
                            Already have an account?
                        </p>

                        <Link
                            to="/"
                            className="login-link"
                        >

                            Login

                        </Link>

                    </div>

                </section>

            </main>


            <footer className="register-footer">

                © 2026 Lab Resource Utilization Platform

            </footer>

        </div>

    );

}

export default Register;