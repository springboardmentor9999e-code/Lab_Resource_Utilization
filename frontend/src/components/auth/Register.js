import { useState } from "react";
import { registerUser } from "../../services/authService";

import {
    BsPersonFill,
    BsEnvelopeFill,
    BsTelephoneFill,
    BsLockFill,
    BsEyeFill,
    BsEyeSlashFill,
    BsPeopleFill
} from "react-icons/bs";

function Register({ onRegisterSuccess }) {

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        roleName: "STUDENT"
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");
        setSuccess("");

        try {

            const response = await registerUser(user);
            
            // Check if response contains error text instead of success text
            if (response.data && response.data.includes("already registered")) {
                setError(response.data);
                return;
            }

            if (
                user.roleName === "STUDENT" ||
                user.roleName === "RESEARCHER"
            ) {

                setSuccess("Registration Successful! You can login now.");

            } else {

                setSuccess(
                    "Registration request submitted successfully. Please wait for approval from the Institution Administrator."
                );

            }

            setTimeout(() => {
                onRegisterSuccess();
            }, 3000);

        } catch (err) {

            setError("Registration Failed. Email might be already registered or server is down.");
            console.error(err);

        }

    };

    return (

        <>

            <h2 className="fw-bold mb-2">
                Create Account
            </h2>

            <p className="text-muted mb-4">
                Register to access the Lab Resource Utilization Platform.
            </p>

            {error && <div className="alert alert-danger p-2 small text-center mb-3">{error}</div>}
            {success && <div className="alert alert-success p-2 small text-center mb-3">{success}</div>}

            <form onSubmit={handleSubmit}>

                <div className="mb-3">

                    <label className="form-label">
                        Full Name
                    </label>

                    <div className="input-group">

                        <span className="input-group-text">
                            <BsPersonFill />
                        </span>

                        <input
                            type="text"
                            className="form-control"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={user.fullName}
                            onChange={handleChange}
                            required
                        />

                    </div>

                </div>

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
                            name="email"
                            placeholder="Enter your email"
                            value={user.email}
                            onChange={handleChange}
                            required
                        />

                    </div>

                </div>

                <div className="mb-3">

                    <label className="form-label">
                        Phone Number
                    </label>

                    <div className="input-group">

                        <span className="input-group-text">
                            <BsTelephoneFill />
                        </span>

                        <input
                            type="text"
                            className="form-control"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={user.phone}
                            onChange={handleChange}
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
                            name="password"
                            placeholder="Create password"
                            value={user.password}
                            onChange={handleChange}
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

                <div className="mb-4">

                    <label className="form-label">
                        Select Role
                    </label>

                    <div className="input-group">

                        <span className="input-group-text">
                            <BsPeopleFill />
                        </span>

                        <select
                            className="form-select"
                            name="roleName"
                            value={user.roleName}
                            onChange={handleChange}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="RESEARCHER">Researcher</option>
                            <option value="LAB_TECHNICIAN">Lab Technician</option>
                            <option value="LAB_MANAGER">Lab Manager</option>
                            <option value="DEPARTMENT_HEAD">Department Head</option>
                            <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                            <option value="SYSTEM_ADMIN">System Administrator</option>
                        </select>

                    </div>

                </div>

                <button
                    type="submit"
                    className="login-btn"
                >
                    Create Account
                </button>

            </form>

        </>

    );

}

export default Register;