import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setEmail("");
      setPassword("");
      setName("");
      setMode("login");
    }
  }, [open]);

  if (!open) return null;

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const loggedIn = await login(email, password);
      localStorage.setItem("mc_seen_modal", "1");
      onClose();
      if (loggedIn.role === "ADMIN") navigate("/profile");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password });
      localStorage.setItem("mc_seen_modal", "1");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Register failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h3>
          <button onClick={onClose} className="text-sm">Close</button>
        </div>
        <form onSubmit={mode === "login" ? doLogin : doRegister} className="mt-4 grid gap-3">
          {mode === "register" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-md border px-3 py-2" required />}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-md border px-3 py-2" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="rounded-md border px-3 py-2" required />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex items-center justify-between">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">{mode === "login" ? "Sign in" : "Create account"}</button>
            <button type="button" className="text-sm text-muted-foreground" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create account" : "Have an account? Sign in"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
