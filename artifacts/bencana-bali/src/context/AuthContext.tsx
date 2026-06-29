import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "relawan" | "donatur" | "pelapor";

export interface AuthUser {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { nama: string; email: string; password: string; role: UserRole }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(u);
    return u;
  };

  const register = async (data: { nama: string; email: string; password: string; role: UserRole }) => {
    const u = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
    setUser(u);
    return u;
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
