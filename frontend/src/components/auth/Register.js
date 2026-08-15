import { useState, useEffect } from "react";
import { registerUser } from "../../services/authService";
import institutionService from "../../services/institutionService";
import departmentService from "../../services/departmentService";

import {
    BsPersonFill,
    BsEnvelopeFill,
    BsTelephoneFill,
    BsLockFill,
    BsEyeFill,
    BsEyeSlashFill,
    BsPeopleFill,
    BsBuilding,
    BsCardText
} from "react-icons/bs";

function Register({ onRegisterSuccess }) {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        roleName: "STUDENT",
        institutionId: "",
        customInstitutionName: "",
        departmentId: "",
        customDepartmentName: "",
        rollNumber: "",
        researchId: ""
    });

    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const response = await institutionService.getAllInstitutions();
                setInstitutions(response.data);
            } catch (err) {
                console.error("Failed to load institutions", err);
            }
        };
        fetchInstitutions();
    }, []);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleInstitutionChange = async (e) => {
        const instId = e.target.value;
        setUser(prev => ({
            ...prev,
            institutionId: instId,
            customInstitutionName: "",
            departmentId: "",
            customDepartmentName: "",
            rollNumber: "",
            researchId: ""
        }));
        
        if (instId && instId !== "CUSTOM") {
            try {
                const response = await departmentService.getDepartmentsByInstitution(instId);
                setDepartments(response.data);
            } catch (err) {
                console.error("Failed to load departments", err);
                setDepartments([]);
            }
        } else {
            setDepartments([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation checks
        if (!user.fullName.trim()) {
            setError("Full name is required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!/^\+?[0-9]{10,15}$/.test(user.phone)) {
            setError("Please enter a valid phone number (10-15 digits).");
            return;
        }
        if (user.password.length < 4) {
            setError("Password must be at least 4 characters.");
            return;
        }
        if (user.password !== user.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        // Institution validation
        if (!user.institutionId) {
            setError("Please select or enter an institution.");
            return;
        }
        if (user.institutionId === "CUSTOM" && !user.customInstitutionName.trim()) {
            setError("Please enter your custom institution name.");
            return;
        }

        const isSysOrInstAdmin = user.roleName === "SYSTEM_ADMIN" || user.roleName === "INSTITUTION_ADMIN";

        // Department validation (NOT required for SYSTEM_ADMIN or INSTITUTION_ADMIN)
        if (!isSysOrInstAdmin) {
            if (!user.departmentId) {
                setError("Please select or enter a department.");
                return;
            }
            if (user.departmentId === "CUSTOM" && !user.customDepartmentName.trim()) {
                setError("Please enter your custom department name.");
                return;
            }
        }

        if (user.roleName === "STUDENT" && !user.rollNumber.trim()) {
            setError("Roll number is required for Students.");
            return;
        }

        try {
            const response = await registerUser({
                fullName: user.fullName,
                email: user.email,
                password: user.password,
                confirmPassword: user.confirmPassword,
                phone: user.phone,
                roleName: user.roleName,
                institutionId: user.institutionId === "CUSTOM" ? null : parseInt(user.institutionId),
                institutionName: user.institutionId === "CUSTOM" ? user.customInstitutionName : null,
                departmentId: isSysOrInstAdmin ? null : (user.departmentId === "CUSTOM" ? null : parseInt(user.departmentId)),
                departmentName: isSysOrInstAdmin ? null : (user.departmentId === "CUSTOM" ? user.customDepartmentName : null),
                rollNumber: user.roleName === "STUDENT" ? user.rollNumber : null,
                researchId: user.roleName === "RESEARCHER" ? user.researchId : null
            });
            
            // Check if response contains error text instead of success text
            if (response.data && (response.data.includes("already registered") || response.data.includes("Invalid") || response.data.includes("match"))) {
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
            setError(err.response?.data || "Registration Failed. Email might be already registered or server is down.");
            console.error(err);
        }
    };

    const isSysOrInstAdmin = user.roleName === "SYSTEM_ADMIN" || user.roleName === "INSTITUTION_ADMIN";

    return (
        <>
            <h2 className="fw-bold mb-2">
                Create Account
            </h2>

            <p className="text-muted mb-4 small">
                Register to access the Lab Resource Utilization Platform.
            </p>

            {error && <div className="alert alert-danger p-2 small text-center mb-3">{error}</div>}
            {success && <div className="alert alert-success p-2 small text-center mb-3">{success}</div>}

            <form onSubmit={handleSubmit}>

                {/* Full Name */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
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

                {/* Email Address */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
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

                {/* Phone Number */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
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
                            placeholder="Enter your phone number (e.g. 9988776655)"
                            value={user.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
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
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
                        Confirm Password
                    </label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <BsLockFill />
                        </span>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={user.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                        </button>
                    </div>
                </div>

                {/* Select Institute */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
                        Select Institute
                    </label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <BsBuilding />
                        </span>
                        <select
                            className="form-select"
                            name="institutionId"
                            value={user.institutionId}
                            onChange={handleInstitutionChange}
                            required
                        >
                            <option value="">-- Select Institute --</option>
                            {institutions.map(inst => (
                                <option key={inst.institutionId} value={inst.institutionId}>
                                    {inst.institutionName}
                                </option>
                            ))}
                            <option value="CUSTOM" className="fw-bold text-primary">+ -- Enter Custom Institute --</option>
                        </select>
                    </div>
                </div>

                {/* Conditional Field: Custom Institute Name */}
                {user.institutionId === "CUSTOM" && (
                    <div className="mb-3 ps-3 border-start border-primary border-2">
                        <label className="form-label small fw-semibold text-primary">
                            Custom Institute Name
                        </label>
                        <div className="input-group">
                            <span className="input-group-text border-primary">
                                <BsBuilding className="text-primary" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-primary"
                                name="customInstitutionName"
                                placeholder="Type your institute name here"
                                value={user.customInstitutionName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Select Department */}
                {!isSysOrInstAdmin && (
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">
                            Select Department
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <BsBuilding />
                            </span>
                            <select
                                className="form-select"
                                name="departmentId"
                                value={user.departmentId}
                                onChange={handleChange}
                                disabled={!user.institutionId}
                                required
                            >
                                <option value="">-- Select Department --</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {dept.departmentName}
                                    </option>
                                ))}
                                {user.institutionId && (
                                    <option value="CUSTOM" className="fw-bold text-primary">+ -- Enter Custom Department --</option>
                                )}
                            </select>
                        </div>
                    </div>
                )}

                {/* Conditional Field: Custom Department Name */}
                {!isSysOrInstAdmin && user.departmentId === "CUSTOM" && (
                    <div className="mb-3 ps-3 border-start border-primary border-2">
                        <label className="form-label small fw-semibold text-primary">
                            Custom Department Name
                        </label>
                        <div className="input-group">
                            <span className="input-group-text border-primary">
                                <BsBuilding className="text-primary" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-primary"
                                name="customDepartmentName"
                                placeholder="Type your department name here"
                                value={user.customDepartmentName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Select Role */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold">
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
                            onChange={(e) => {
                                setUser({
                                    ...user,
                                    roleName: e.target.value,
                                    rollNumber: "",
                                    researchId: ""
                                });
                            }}
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

                {/* Conditional Field: Roll Number (Only for Student) */}
                {user.roleName === "STUDENT" && (
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">
                            Roll Number
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <BsCardText />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                name="rollNumber"
                                placeholder="Enter your student roll number"
                                value={user.rollNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Conditional Field: Research ID (Optional, Only for Researcher) */}
                {user.roleName === "RESEARCHER" && (
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">
                            Research ID (Optional)
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <BsCardText />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                name="researchId"
                                placeholder="Enter your research identifier"
                                value={user.researchId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="login-btn mt-2"
                >
                    Create Account
                </button>
            </form>
        </>
    );
}

export default Register;