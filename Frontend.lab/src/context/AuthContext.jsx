import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth details from localStorage on application startup
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username") || localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setUser({
        username: storedUsername || "User",
        email: storedEmail || "",
        role: storedRole,
        token: storedToken,
      });
    }
    setLoading(false);
  }, []);

  const login = (jwtToken, userRole, username, email) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("role", userRole);
    localStorage.setItem("username", username);
    localStorage.setItem("name", username);
    localStorage.setItem("email", email);

    setToken(jwtToken);
    setRole(userRole);
    setUser({
      username,
      email,
      role: userRole,
      token: jwtToken,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    setToken(null);
    setRole(null);
    setUser(null);
    
    // Redirect to login page
    window.location.href = "/login";
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {loading ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "#ffffff",
          fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "5px solid rgba(255, 255, 255, 0.1)",
            borderTop: "5px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
          }} />
          <h2 style={{
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.5px",
            fontSize: "1.5rem",
          }}>
            LAB PLATFORM
          </h2>
          <p style={{
            color: "#94a3b8",
            fontSize: "0.875rem",
            marginTop: "8px",
            fontWeight: 500,
          }}>
            Initializing secure session, please wait...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
