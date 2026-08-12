import { useState, useEffect, useRef } from "react";
import { loginUser, googleLogin, getGoogleConfig } from "../../services/authService";
import { useNavigate } from "react-router-dom";

import {
    BsEnvelopeFill,
    BsLockFill,
    BsEyeFill,
    BsEyeSlashFill,
    BsGoogle,
    BsPersonPlusFill
} from "react-icons/bs";

const DEFAULT_GOOGLE_CLIENT_ID = "818937469889-hv4k2ig0ev0brbmc67vps571ervsq8fu.apps.googleusercontent.com";

function Login({ onLogin, onForgotPassword, onGoToRegister }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [notRegisteredError, setNotRegisteredError] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleClientId, setGoogleClientId] = useState(
        process.env.REACT_APP_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
    );
    const navigate = useNavigate();
    const tokenClientRef = useRef(null);

    // 1. Ensure Google Identity Services script is loaded and fetch client ID if needed
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        // Fetch backend Google configuration if not provided by env
        if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
            getGoogleConfig()
                .then((res) => {
                    if (res.data && res.data.clientId) {
                        setGoogleClientId(res.data.clientId);
                    }
                })
                .catch((err) => {
                    console.warn("[Google OAuth Config] Could not fetch config from backend:", err.message);
                });
        }
    }, []);

    const navigateToRoleDashboard = (role) => {
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
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setNotRegisteredError(false);

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
                setError(response.data.message || "Invalid login credentials.");
                return;
            }

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.userId);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("fullName", response.data.fullName);
            localStorage.setItem("email", response.data.email);
            localStorage.setItem("institutionId", response.data.institutionId || "");
            localStorage.setItem("departmentId", response.data.departmentId || "");

            navigateToRoleDashboard(response.data.role);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || err.response.data || "Login failed");
            } else {
                setError("Unable to connect to server.");
            }
        }
    };

    const handleGoogleLogin = () => {
        setError("");
        setNotRegisteredError(false);

        const clientIdToUse = googleClientId || process.env.REACT_APP_GOOGLE_CLIENT_ID;

        if (!clientIdToUse || clientIdToUse.trim() === "" || clientIdToUse.includes("mock-")) {
            setError("Google OAuth is not configured with a valid Google Cloud Client ID. Please set GOOGLE_CLIENT_ID with Authorized Origin: http://localhost:3000 in your configuration.");
            console.error("[Google OAuth] Missing valid Google Client ID. Visit Google Cloud Console to create an OAuth 2.0 Web Application client.");
            return;
        }

        setGoogleLoading(true);

        try {
            if (window.google && window.google.accounts && window.google.accounts.oauth2) {
                const tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientIdToUse.trim(),
                    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
                    prompt: "select_account",
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            if (tokenResponse.error !== "popup_closed_by_user" && tokenResponse.error !== "access_denied") {
                                setError("Google authentication error: " + tokenResponse.error);
                            }
                            setGoogleLoading(false);
                            return;
                        }

                        if (!tokenResponse.access_token) {
                            setError("No access token returned from Google. Please try again.");
                            setGoogleLoading(false);
                            return;
                        }

                        // Send Google OAuth Access Token to backend for verification
                        try {
                            const res = await googleLogin({
                                accessToken: tokenResponse.access_token
                            });

                            if (!res.data.token) {
                                if (res.data.registered === false || (res.data.message && res.data.message.includes("not registered"))) {
                                    setNotRegisteredError(true);
                                    setError("Account not registered. Please register first before using Google Sign-In.");
                                } else {
                                    setError(res.data.message || "Google login failed.");
                                }
                                setGoogleLoading(false);
                                return;
                            }

                            // User is verified and registered
                            localStorage.setItem("token", res.data.token);
                            localStorage.setItem("userId", res.data.userId);
                            localStorage.setItem("role", res.data.role);
                            localStorage.setItem("fullName", res.data.fullName);
                            localStorage.setItem("email", res.data.email);
                            localStorage.setItem("institutionId", res.data.institutionId || "");
                            localStorage.setItem("departmentId", res.data.departmentId || "");

                            navigateToRoleDashboard(res.data.role);
                        } catch (backendErr) {
                            const msg = backendErr.response?.data?.message || backendErr.response?.data || "Failed to authenticate Google account with server.";
                            if (typeof msg === "string" && msg.includes("not registered")) {
                                setNotRegisteredError(true);
                                setError("Account not registered. Please register first before using Google Sign-In.");
                            } else {
                                setError(msg);
                            }
                        } finally {
                            setGoogleLoading(false);
                        }
                    }
                });

                tokenClientRef.current = tokenClient;
                tokenClient.requestAccessToken({ prompt: "select_account" });
            } else {
                setError("Google Sign-In is initializing. Please click 'Continue with Google' again in a few seconds.");
                setGoogleLoading(false);
            }
        } catch (err) {
            console.error("Google Auth initialization error", err);
            setError("Google OAuth could not be initialized. Please check network connection.");
            setGoogleLoading(false);
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

            {error && (
                <div className="alert alert-danger p-3 small text-center mb-3">
                    <p className="mb-0 fw-semibold">{error}</p>
                    {notRegisteredError && onGoToRegister && (
                        <div className="mt-2 pt-2 border-top border-danger-subtle">
                            <button
                                type="button"
                                className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                                onClick={onGoToRegister}
                            >
                                <BsPersonPlusFill /> Register Here
                            </button>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">
                        <span className="input-group-text"><BsEnvelopeFill /></span>
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
                    <label className="form-label">Password</label>
                    <div className="input-group">
                        <span className="input-group-text"><BsLockFill /></span>
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
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                        </button>
                    </div>
                </div>

                <div className="d-flex justify-content-between mb-4">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="remember" />
                        <label className="form-check-label" htmlFor="remember">Remember Me</label>
                    </div>
                    <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={onForgotPassword}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button type="submit" className="login-btn mb-3">
                    Login
                </button>

                <div className="text-center mb-3">
                    <span className="text-muted">or continue with</span>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center py-2"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                >
                    <BsGoogle className="me-2 text-danger" />
                    {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                </button>
            </form>
        </>
    );
}

export default Login;