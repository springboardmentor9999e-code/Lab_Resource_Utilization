import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const email = localStorage.getItem("email");
        const userId = localStorage.getItem("userId");

        if (token) {

            setUser({
                token,
                role,
                email,
                userId
            });

        }

    }, []);

    const login = (data) => {

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        localStorage.setItem("userId", data.userId);

        setUser(data);

    };

    const logout = () => {

        localStorage.clear();

        setUser(null);

        window.location.href = "/";

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};