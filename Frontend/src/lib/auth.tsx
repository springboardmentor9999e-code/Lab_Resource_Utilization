import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "@/services/authService";
import { setUnauthorizedHandler, TOKEN_KEY, USER_KEY } from "@/services/api";

export type Role =
  | "STUDENT"
  | "RESEARCHER"
  | "LAB_TECHNICIAN"
  | "LAB_MANAGER"
  | "DEPARTMENT_HEAD"
  | "INSTITUTION_ADMIN"
  | "SYSTEM_ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  institutionId?: number | null;
  firstName?: string;
  lastName?: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: authService.RegisterPayload) => Promise<authService.AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export const ROLE_HOME: Record<Role, string> = {
  STUDENT: "/student/dashboard",
  RESEARCHER: "/researcher/dashboard",
  LAB_TECHNICIAN: "/technician/dashboard",
  LAB_MANAGER: "/manager/dashboard",
  DEPARTMENT_HEAD: "/department-head/dashboard",
  INSTITUTION_ADMIN: "/institution-admin/dashboard",
  SYSTEM_ADMIN: "/system-admin/dashboard",
};

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  RESEARCHER: "Researcher",
  LAB_TECHNICIAN: "Lab Technician",
  LAB_MANAGER: "Lab Manager",
  DEPARTMENT_HEAD: "Department Head",
  INSTITUTION_ADMIN: "Institution Admin",
  SYSTEM_ADMIN: "System Admin",
};

function decodeJwt(token: string): { exp?: number; sub?: string; role?: string } | null {
  try {
    const [, payload] = token.split(".");
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const p = decodeJwt(token);
  if (!p?.exp) return true;
  return p.exp * 1000 > Date.now();
}

function fromCurrentUser(u: authService.CurrentUser): User {
  return {
    id: u.userId,
    name: u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
    email: u.email,
    role: u.role,
    phone: u.phone ?? undefined,
    institutionId: u.institutionId,
    firstName: u.firstName,
    lastName: u.lastName,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
    });
    (async () => {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        if (t && isTokenValid(t)) {
          setToken(t);
          const cached = localStorage.getItem(USER_KEY);
          if (cached) setUser(JSON.parse(cached));
          // Always re-hydrate from /me to trust the server.
          try {
            const fresh = await authService.me();
            const u = fromCurrentUser(fresh);
            setUser(u);
            localStorage.setItem(USER_KEY, JSON.stringify(u));
          } catch {
            /* interceptor will handle 401 */
          }
        } else if (t) {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    const res = await authService.login(email, password);
    if (!res.token) throw new Error(res.message || "Login failed");
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    const profile = await authService.me();
    const u = fromCurrentUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register: AuthCtx["register"] = async (payload) => {
    const res = await authService.register(payload);
    if (!res.token) throw new Error(res.message || "Registration failed");
    return res;
  };

  const logout = () => clearSession();

  return (
    <Ctx.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
