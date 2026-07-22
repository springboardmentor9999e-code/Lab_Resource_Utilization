import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, register as registerApi } from "../api/auth";

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem("lrp_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep multiple tabs in sync if the user logs out in one of them.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "lrp_user") {
        setUser(readStoredUser());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(credentials) {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(credentials);
      const nextUser = {
        userId: data.userId,
        name: data.name,
        email: data.email ?? credentials.email,
        role: data.role,
        institutionId: data.institutionId,
      };
      localStorage.setItem("lrp_token", data.token);
      localStorage.setItem("lrp_user", JSON.stringify(nextUser));
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error || "Invalid email or password.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    setError(null);
    try {
      return await registerApi(payload);
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data?.error || "Registration failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("lrp_token");
    localStorage.removeItem("lrp_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
