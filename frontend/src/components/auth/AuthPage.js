import { useState } from "react";
import "./AuthPage.css";

import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";

import labImage from "../../assets/images/lab-illustration.png";

function AuthPage({ onLogin }) {

    const [page, setPage] = useState("login");

    return (

        <div className="auth-page">

            <div className="container auth-wrapper">

                <div className="row g-0">

                    {/* LEFT SIDE */}

                    <div className="col-lg-6 left-side d-flex flex-column justify-content-center">

                        <img
                            src={labImage}
                            alt="Lab Illustration"
                            className="img-fluid mb-4"
                            style={{ maxHeight: "280px" }}
                        />

                        <h1>
                            Lab Resource
                            <br />
                            Utilization Platform
                        </h1>

                        <p>
                            Optimize laboratory resources with intelligent
                            equipment booking, real-time monitoring,
                            approval workflow, and secure role-based access.
                        </p>

                        <div className="feature-box">

                            <h5>🔹 Smart Booking</h5>

                            <small>
                                Reserve laboratory equipment quickly and efficiently.
                            </small>

                        </div>

                        <div className="feature-box">

                            <h5>🔹 Real-Time Monitoring</h5>

                            <small>
                                Track equipment availability instantly.
                            </small>

                        </div>

                        <div className="feature-box">

                            <h5>🔹 Secure Role Access</h5>

                            <small>
                                Student, Researcher, Technician and Admin portals.
                            </small>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="col-lg-6 right-side">

                        <div className="auth-top">

                            <button
                                className={page === "login"
                                    ? "active-tab"
                                    : "btn btn-light"}
                                onClick={() => setPage("login")}
                            >
                                Login
                            </button>

                            <button
                                className={page === "register"
                                    ? "active-tab"
                                    : "btn btn-light"}
                                onClick={() => setPage("register")}
                            >
                                Register
                            </button>

                        </div>

                        {page === "login" && (
                            <Login
                                onLogin={onLogin}
                                onForgotPassword={() => setPage("forgot")}
                                onGoToRegister={() => setPage("register")}
                            />
                        )}

                        {page === "register" && (
                            <Register
                                onRegisterSuccess={() => setPage("login")}
                            />
                        )}

                        {page === "forgot" && (
                            <ForgotPassword
                                onBack={() => setPage("login")}
                            />
                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AuthPage;