import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AddDoctorPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("Psychologist");
  const [experienceYears, setExperienceYears] = useState(1);
  const [feesINR, setFeesINR] = useState(1000);
  const [background, setBackground] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [languages, setLanguages] = useState("English");
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useAuth();
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name, city, specialty, experienceYears, background, feesINR, languages, avatarUrl };
    // try server first
    try {
      const res = await fetchWithAuth("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let info: any = null;
        try { info = await res.json(); } catch { info = await res.text(); }
        // fallback to client save
        console.warn("Server create failed, saving locally:", info);
        saveLocal();
        nav(`/doctors?city=${encodeURIComponent(city)}`);
        return;
      }
      try {
        if ((res.headers.get("content-type") || "").includes("application/json")) {
          const json = await res.json();
          console.log("Created doctor", json);
        }
      } catch (e) {
        console.warn('Could not parse create response as JSON', e);
      }
      nav(`/doctors?city=${encodeURIComponent(city)}`);
    } catch (err) {
      console.error(err);
      saveLocal();
      nav(`/doctors?city=${encodeURIComponent(city)}`);
    }
  }

  function saveLocal() {
    const raw = localStorage.getItem("mc_doctors_v1");
    const all = raw ? JSON.parse(raw) : [];
    all.push({ id: "local-" + Math.random().toString(36).slice(2, 8), name, city, specialty, experienceYears, background, feesINR, languages: languages.split(",").map((s: string) => s.trim()), avatarUrl, rating: 4.5, freeSlots: [] });
    localStorage.setItem("mc_doctors_v1", JSON.stringify(all));
  }

  return (
    <main className="container py-8">
      <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-semibold">Add Doctor Profile</h1>
        <p className="text-sm text-muted-foreground">Fill details below to add a doctor to the directory. Admins can post directly to the server.</p>
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-md border px-3 py-2" required />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded-md border px-3 py-2" required />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="rounded-md border px-3 py-2">
            <option>Psychologist</option>
            <option>Psychiatrist</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} type="number" min={0} className="rounded-md border px-3 py-2" />
            <input value={feesINR} onChange={(e) => setFeesINR(Number(e.target.value))} type="number" min={0} className="rounded-md border px-3 py-2" />
          </div>
          <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Languages (comma separated)" className="rounded-md border px-3 py-2" />
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Avatar image URL" className="rounded-md border px-3 py-2" />
          <textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="Background / bio" className="rounded-md border px-3 py-2" />

          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end">
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Add Doctor</button>
          </div>
        </form>
      </div>
    </main>
  );
}
