import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const loggedIn = await login(email, password);
      nav(loggedIn.role === "ADMIN" ? "/profile" : "/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  }

  return (
    <main className="container py-12">
      <div className="mx-auto max-w-md rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Use your email to sign in to MindConnect</p>
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-md border px-3 py-2" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="rounded-md border px-3 py-2" />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex items-center justify-between">
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Sign in</button>
            <Link to="/register" className="text-sm text-muted-foreground underline">Create account</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
