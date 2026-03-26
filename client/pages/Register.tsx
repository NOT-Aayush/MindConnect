import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password, city });
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Register failed");
    }
  }

  return (
    <main className="container py-12">
      <div className="mx-auto max-w-md rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Sign up to book appointments and access your dashboard</p>
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-md border px-3 py-2" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-md border px-3 py-2" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="rounded-md border px-3 py-2" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded-md border px-3 py-2" />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex items-center justify-between">
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Create account</button>
            <Link to="/login" className="text-sm text-muted-foreground underline">Already have an account?</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
