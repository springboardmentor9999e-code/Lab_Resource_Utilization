import { useState } from "react";
import { forgotPassword, verifyOtp, resetPassword } from "../../services/authService";
import {
    BsEnvelopeFill,
    BsKeyFill,
    BsLockFill,
    BsEyeFill,
    BsEyeSlashFill,
    BsArrowLeft,
    BsCheckCircleFill
} from "react-icons/bs";

function ForgotPassword({ onBack }) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!email.trim()) {
            setError("Please enter your registered email address.");
            return;
        }

        setLoading(true);
        try {
            const res = await forgotPassword(email.trim());
            if (res.data.success) {
                setInfo("A 6-digit verification code has been sent to your registered email and phone.");
                setStep(2);
            } else {
                setError(res.data.message || "Failed to send OTP. Please try again.");
            }
        } catch (err) {
            setError("Server error while requesting OTP. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!otp.trim() || otp.trim().length !== 6) {
            setError("Please enter the 6-digit OTP sent to your email.");
            return;
        }

        setLoading(true);
        try {
            const res = await verifyOtp(email.trim(), otp.trim());
            if (res.data.valid) {
                setInfo("OTP verified successfully. Please enter your new password.");
                setStep(3);
            } else {
                setError(res.data.message || "Invalid or expired OTP. Please try again.");
            }
        } catch (err) {
            setError("Verification failed. Please check your code and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!newPassword || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword({
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
                confirmPassword
            });

            if (res.data.success) {
                setStep(4);
            } else {
                setError(res.data.message || "Failed to reset password.");
            }
        } catch (err) {
            setError("Error resetting password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="fw-bold mb-2">
                {step === 4 ? "Password Reset Complete 🎉" : "Forgot Password"}
            </h2>

            <p className="text-muted mb-4">
                {step === 1 && "Enter your registered email address. We'll send you a One-Time Password (OTP)."}
                {step === 2 && `Enter the 6-digit OTP sent to ${email}.`}
                {step === 3 && "Create a secure new password for your account."}
                {step === 4 && "Your password has been successfully updated. You can now sign in."}
            </p>

            {error && <div className="alert alert-danger p-2 small text-center mb-3">{error}</div>}
            {info && <div className="alert alert-info p-2 small text-center mb-3">{info}</div>}

            {/* STEP 1: Email Form */}
            {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <div className="mb-4">
                        <label className="form-label fw-semibold small">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text"><BsEnvelopeFill /></span>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn mb-3" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send Verification Code"}
                    </button>

                    <button type="button" className="btn btn-outline-secondary w-100" onClick={onBack}>
                        <BsArrowLeft className="me-2" /> Back to Login
                    </button>
                </form>
            )}

            {/* STEP 2: OTP Verification Form */}
            {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">6-Digit OTP Code</label>
                        <div className="input-group">
                            <span className="input-group-text"><BsKeyFill /></span>
                            <input
                                type="text"
                                maxLength="6"
                                className="form-control text-center fw-bold fs-5 letter-spacing-2"
                                placeholder="••••••"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                required
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <small className="text-muted d-block mt-1">Code expires in 10 minutes.</small>
                    </div>

                    <button type="submit" className="login-btn mb-3" disabled={loading}>
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>

                    <div className="d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none small"
                            onClick={handleSendOtp}
                            disabled={loading}
                        >
                            Resend Code
                        </button>
                        <button
                            type="button"
                            className="btn btn-link p-0 text-secondary text-decoration-none small"
                            onClick={() => { setStep(1); setOtp(""); }}
                        >
                            Change Email
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 3: New Password Form */}
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small">New Password</label>
                        <div className="input-group">
                            <span className="input-group-text"><BsLockFill /></span>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Enter new password (min 6 chars)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold small">Confirm New Password</label>
                        <div className="input-group">
                            <span className="input-group-text"><BsLockFill /></span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
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

                    <button type="submit" className="login-btn mb-3" disabled={loading}>
                        {loading ? "Updating Password..." : "Reset Password"}
                    </button>
                </form>
            )}

            {/* STEP 4: Success Screen */}
            {step === 4 && (
                <div className="text-center py-3">
                    <BsCheckCircleFill className="text-success mb-3" size={50} />
                    <h5 className="fw-bold mb-2">Password Successfully Reset!</h5>
                    <p className="text-muted small mb-4">
                        You can now log in to the Lab Resource Utilization Platform using your new password.
                    </p>
                    <button type="button" className="login-btn" onClick={onBack}>
                        Proceed to Login
                    </button>
                </div>
            )}
        </div>
    );
}

export default ForgotPassword;