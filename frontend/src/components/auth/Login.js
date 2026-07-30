import { useState } from "react";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

import {
    BsEnvelopeFill,
    BsLockFill,
    BsEyeFill,
    BsEyeSlashFill,
    BsGoogle
} from "react-icons/bs";

function Login({ onLogin, onForgotPassword }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        setError("");

        if (email.trim() === "" || password.trim() === "") {
            setError("Please enter Email and Password.");
            return;
        }

        try {

            const response = await loginUser({
                email,
                password
            });

            if (!response.data.token) {
                setError(response.data.message);
                return;
            }

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.userId);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("fullName", response.data.fullName);
            localStorage.setItem("email", response.data.email);

            const role = response.data.role;

            switch (role) {

                case "STUDENT":
                    navigate("/student-dashboard");
                    break;

                case "RESEARCHER":
                    navigate("/researcher-dashboard");
                    break;

                case "LAB_TECHNICIAN":
                    navigate("/technician-dashboard");
                    break;

                case "LAB_MANAGER":
                    navigate("/manager-dashboard");
                    break;

                case "DEPARTMENT_HEAD":
                    navigate("/department-dashboard");
                    break;

                case "INSTITUTION_ADMIN":
                    navigate("/institution-dashboard");
                    break;

                case "SYSTEM_ADMIN":
                    navigate("/system-dashboard");
                    break;

                default:
                    navigate("/");
            }

        } catch (err) {

            if (err.response) {
                setError(err.response.data.message || err.response.data || "Login failed");
            } else {
                setError("Unable to connect to server.");
            }

        }

    };

    return (

        <>

            <h2 className="fw-bold mb-2">
                Welcome Back 👋
            </h2>

            <p className="text-muted mb-4">
                Sign in to continue to your account.
            </p>

            {error && <div className="alert alert-danger p-2 small text-center mb-3">{error}</div>}

            <form onSubmit={handleLogin}>

                <div className="mb-3">

                    <label className="form-label">
                        Email Address
                    </label>

                    <div className="input-group">

                        <span className="input-group-text">
                            <BsEnvelopeFill />
                        </span>

                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Password
                    </label>

                    <div className="input-group">

                        <span className="input-group-text">
                            <BsLockFill />
                        </span>

                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >
                            {showPassword
                                ? <BsEyeSlashFill />
                                : <BsEyeFill />}
                        </button>

                    </div>

                </div>

                <div className="d-flex justify-content-between mb-4">

                    <div className="form-check">

                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember"
                        />

                        <label
                            className="form-check-label"
                            htmlFor="remember"
                        >
                            Remember Me
                        </label>

                    </div>

                    <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={onForgotPassword}
                    >
                        Forgot Password?
                    </button>

                </div>

                <button
                    type="submit"
                    className="login-btn mb-3"
                >
                    Login
                </button>

                <div className="text-center mb-3">

                    <span className="text-muted">
                        or continue with
                    </span>

                </div>

                <button
                    type="button"
                    className="btn btn-outline-dark w-100"
                >
                    <BsGoogle className="me-2" />

                    Continue with Google

                </button>

            </form>

        </>

    );

}

export default Login;