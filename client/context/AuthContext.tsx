import React, { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role: string; city?: string; phone?: string } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<NonNullable<User>>;
  register: (data: { name: string; email: string; password: string; phone?: string; city?: string; role?: string }) => Promise<NonNullable<User>>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("mc_token"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("failed");
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          setUser(json.user);
        } else {
          const t = await res.text();
          console.error('Expected JSON from /api/auth/me, got:', t.slice(0,200));
          throw new Error('Invalid auth response');
        }
      } catch (err) {
        console.error("Auth load failed", err);
        setToken(null);
        localStorage.removeItem("mc_token");
      } finally {
        setReady(true);
      }
    }
    load();
  }, []);

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("failed");
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("Invalid auth response");
      const json = await res.json();
      setUser(json.user);
    } catch {
      setToken(null);
      setUser(null);
      localStorage.removeItem("mc_token");
    }
  }

  useEffect(() => {
    if (token) localStorage.setItem("mc_token", token);
    else localStorage.removeItem("mc_token");
  }, [token]);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let info: any = null;
      try { info = await res.json(); } catch { info = await res.text(); }
      throw new Error(info?.error || info || "Login failed");
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const json = await res.json();
      setToken(json.token);
      setUser(json.user);
      return json.user as NonNullable<User>;
    } else {
      const t = await res.text();
      throw new Error(t || "Login failed");
    }
  }

  async function register(data: { name: string; email: string; password: string; phone?: string; city?: string; role?: string }) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let info: any = null;
      try { info = await res.json(); } catch { info = await res.text(); }
      throw new Error(info?.error || info || "Register failed");
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const json = await res.json();
      setToken(json.token);
      setUser(json.user);
      return json.user as NonNullable<User>;
    } else {
      const t = await res.text();
      throw new Error(t || "Register failed");
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
    const headers = new Headers(init?.headers as HeadersInit);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(input, { ...init, headers });
    return res;
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, refreshUser, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
