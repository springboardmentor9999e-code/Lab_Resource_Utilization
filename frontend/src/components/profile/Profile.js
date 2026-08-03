import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import userService from "../../services/userService";
import {
    BsTelephone,
    BsEnvelope,
    BsLock,
    BsBuilding,
    BsPersonBadge,
    BsShieldLock,
    BsCamera,
    BsPencilSquare,
    BsCheckLg,
    BsXCircle
} from "react-icons/bs";

function Profile() {
    const navigate = useNavigate();

    // Profile details state
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form inputs for profile edit
    const [editForm, setEditForm] = useState({
        fullName: "",
        phone: "",
        profilePhoto: ""
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Load user profile details on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await userService.getUserProfile();
            setProfile(response.data);
            setEditForm({
                fullName: response.data.fullName || "",
                phone: response.data.phone || "",
                profilePhoto: response.data.profilePhoto || ""
            });
        } catch (err) {
            setError(err.response?.data || "Failed to load profile details.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChangeInput = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                setError("Image size must be less than 1MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm((prev) => ({
                    ...prev,
                    profilePhoto: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!editForm.fullName.trim()) {
            setError("Full Name cannot be empty.");
            return;
        }

        if (!editForm.phone.trim() || !/^\+?[0-9]{10,15}$/.test(editForm.phone)) {
            setError("Invalid phone number. Must be 10 to 15 digits.");
            return;
        }

        try {
            const response = await userService.updateUserProfile({
                fullName: editForm.fullName,
                phone: editForm.phone,
                profilePhoto: editForm.profilePhoto
            });
            setProfile(response.data);
            setIsEditing(false);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setError(err.response?.data || "Failed to update profile.");
            console.error(err);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!passwordForm.currentPassword) {
            setPasswordError("Current password is required.");
            return;
        }

        if (passwordForm.newPassword.length < 4) {
            setPasswordError("New password must be at least 4 characters.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New Password and Confirm Password do not match.");
            return;
        }

        try {
            await userService.changePassword(passwordForm);
            setPasswordSuccess("Password changed successfully! Logging out...");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            // Redirect to login page after 2.5 seconds
            setTimeout(() => {
                localStorage.clear();
                navigate("/");
            }, 2500);
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data || "Failed to change password.";
            setPasswordError(msg);
            console.error(err);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="My Profile">
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const defaultAvatarUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <DashboardLayout title="User Profile Workspace">
            <div className="container-fluid py-2">
                
                {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}</div>}
                {success && <div className="alert alert-success alert-dismissible fade show" role="alert">{success}</div>}

                <div className="row g-4">
                    {/* Left Column: Profile Card */}
                    <div className="col-12 col-md-4 col-lg-4">
                        <div className="card shadow-sm border-0 h-100 text-center p-4 position-relative">
                            <div className="mx-auto mb-3 position-relative" style={{ width: "130px", height: "130px" }}>
                                {editForm.profilePhoto || (profile && profile.profilePhoto) ? (
                                    <img
                                        src={isEditing ? editForm.profilePhoto : profile.profilePhoto}
                                        alt="Profile"
                                        className="rounded-circle border"
                                        style={{ width: "130px", height: "130px", objectFit: "cover" }}
                                    />
                                ) : (
                                    <img
                                        src={defaultAvatarUrl}
                                        alt="Default Avatar"
                                        className="rounded-circle border"
                                        style={{ width: "130px", height: "130px", objectFit: "cover" }}
                                    />
                                )}
                                
                                {isEditing && (
                                    <label
                                        htmlFor="avatar-upload"
                                        className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle border border-white cursor-pointer"
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        title="Upload Photo"
                                    >
                                        <BsCamera style={{ fontSize: "16px" }} />
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                )}
                            </div>

                            <h4 className="fw-bold mb-1 text-dark">
                                {profile ? profile.fullName : "N/A"}
                            </h4>
                            
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill small mb-3 align-self-center">
                                {profile ? profile.roleName.replace("_", " ") : "N/A"}
                            </span>

                            <div className="border-top pt-3 text-start small mt-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Account Status:</span>
                                    <span className={`fw-bold ${profile && profile.status === "ACTIVE" ? "text-success" : "text-warning"}`}>
                                        {profile ? profile.status : "N/A"}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Registration Date:</span>
                                    <span className="fw-medium text-dark">
                                        {profile ? profile.registrationDate || "N/A" : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information & Password Section */}
                    <div className="col-12 col-md-8 col-lg-8">
                        <div className="card shadow-sm border-0 p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                                <h5 className="fw-bold mb-0 d-flex align-items-center text-dark">
                                    <BsPersonBadge className="me-2 text-primary" /> Profile Information
                                </h5>
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <BsPencilSquare className="me-1" /> Edit Profile
                                    </button>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm d-flex align-items-center"
                                            onClick={handleSaveProfile}
                                        >
                                            <BsCheckLg className="me-1" /> Save
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm d-flex align-items-center"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditForm({
                                                    fullName: profile.fullName || "",
                                                    phone: profile.phone || "",
                                                    profilePhoto: profile.profilePhoto || ""
                                                });
                                            }}
                                        >
                                            <BsXCircle className="me-1" /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSaveProfile}>
                                <h6 className="text-muted text-uppercase mb-3 fw-bold small">Personal Information</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullName"
                                            value={editForm.fullName}
                                            onChange={handleEditChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Email Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted">
                                                <BsEnvelope />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control bg-light"
                                                value={profile ? profile.email : ""}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Phone Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted">
                                                <BsTelephone />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="phone"
                                                value={editForm.phone}
                                                onChange={handleEditChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h6 className="text-muted text-uppercase mb-3 fw-bold small">Organization Details</h6>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Institution</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted">
                                                <BsBuilding />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={profile ? profile.institutionName || "None" : ""}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted small fw-semibold">Department</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted">
                                                <BsBuilding />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={profile ? profile.departmentName || "None" : ""}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    
                                    {profile && profile.roleName === "STUDENT" && (
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-muted small fw-semibold">Roll Number</label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={profile.rollNumber || ""}
                                                disabled
                                            />
                                        </div>
                                    )}

                                    {profile && profile.roleName === "RESEARCHER" && (
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-muted small fw-semibold">Research ID</label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={profile.researchId || "None"}
                                                disabled
                                            />
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Security: Change Password Card */}
                        <div className="card shadow-sm border-0 p-4">
                            <h5 className="fw-bold mb-4 border-bottom pb-2 d-flex align-items-center text-dark">
                                <BsShieldLock className="me-2 text-primary" /> Security Settings
                            </h5>

                            {passwordError && <div className="alert alert-danger p-2 small text-center mb-3">{passwordError}</div>}
                            {passwordSuccess && <div className="alert alert-success p-2 small text-center mb-3">{passwordSuccess}</div>}

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label text-muted small fw-semibold">Current Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <BsLock />
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="currentPassword"
                                                placeholder="Enter current password"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordChangeInput}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label text-muted small fw-semibold">New Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <BsLock />
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="newPassword"
                                                placeholder="Enter new password"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChangeInput}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label text-muted small fw-semibold">Confirm New Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <BsLock />
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="confirmPassword"
                                                placeholder="Confirm new password"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChangeInput}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                                    >
                                        <BsShieldLock /> Change Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Profile;
