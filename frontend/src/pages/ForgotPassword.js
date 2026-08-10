import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/forgot-password`, {
                email,
            });

            setMessage(response.data.message || "OTP sent successfully.");
            setStep(2);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to send OTP."
            );
        }

        setLoading(false);
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/verify-otp`, {
                email,
                otp,
            });

            setMessage(response.data.message || "OTP verified.");
            setStep(3);
        } catch (err) {
            setError(
                err.response?.data?.message || "Invalid OTP."
            );
        }

        setLoading(false);
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        clearMessages();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/reset-password`, {
                email,
                otp,
                newPassword,
            });

            setMessage(
                response.data.message || "Password reset successfully."
            );
            setStep(4);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password."
            );
        }

        setLoading(false);
    };

    return (
        <div
            style={{
                width: "400px",
                margin: "50px auto",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        >
            <h2 style={{ textAlign: "center" }}>Forgot Password</h2>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {step === 1 && (
                <form onSubmit={sendOtp}>
                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px" }}
                    />

                    <br />
                    <br />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", padding: "10px" }}
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={verifyOtp}>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px" }}
                    />

                    <br />
                    <br />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", padding: "10px" }}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={resetPassword}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px" }}
                    />

                    <br />
                    <br />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px" }}
                    />

                    <br />
                    <br />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", padding: "10px" }}
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            )}

            {step === 4 && (
                <div style={{ textAlign: "center" }}>
                    <h3>Password Reset Successful!</h3>
                    <p>You can now log in with your new password.</p>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;