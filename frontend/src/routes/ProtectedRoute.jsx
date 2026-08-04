import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

    console.log("ProtectedRoute Loaded");

    const token = localStorage.getItem("token");

    console.log("Token =", token);

    if (!token) {
        console.log("Redirecting...");
        return <Navigate to="/" replace />;
    }

    console.log("Access Granted");

    return children;
}

export default ProtectedRoute;