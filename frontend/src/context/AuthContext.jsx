import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    const [fullName, setFullName] = useState(localStorage.getItem("fullName"));
    const [institutionId, setInstitutionId] = useState(localStorage.getItem("institutionId"));

    const login = (
        token,
        role,
        userId,
        fullName,
        institutionId
    ) => {

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("institutionId", institutionId);

        setToken(token);
        setRole(role);
        setUserId(userId);
        setFullName(fullName);
        setInstitutionId(institutionId);
    };

    const logout = () => {

        localStorage.clear();

        setToken(null);
        setRole(null);
        setUserId(null);
        setFullName(null);
        setInstitutionId(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                userId,
                fullName,
                institutionId,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}