import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DoctorCard from "@/components/DoctorCard";
import { useAuth } from "@/context/AuthContext";
import { doctors as staticDoctors } from "@/data/doctors";

export default function DoctorsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const city = params.get("city") ?? "Delhi";
  const [specialty, setSpecialty] = useState<string>(params.get("specialty") ?? "All");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const q = new URLSearchParams();
      if (city) q.set("city", city);
      try {
        const res = await fetch(`/api/doctors?${q.toString()}`);
        let json: any = {};
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) json = await res.json();
          else {
            const text = await res.text();
            console.error("Expected JSON from /api/doctors, got:", text.slice(0, 200));
            json = {};
          }
        } catch (e) {
          console.error("Failed to parse /api/doctors response", e);
          json = {};
        }

        // Use only database data
        let list = json.doctors || [];
        
        // merge local added doctors from localStorage
        try {
          const rawLocal = localStorage.getItem('mc_doctors_v1');
          if (rawLocal) {
            const localDocs = JSON.parse(rawLocal);
            list = [...list, ...localDocs];
          }
        } catch {}
        if (specialty !== "All") list = list.filter((d: any) => d.specialty === specialty);
        setDoctors(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [city, specialty]);

  const handleBook = (doctor: any) => {
    navigate(`/appointments?city=${encodeURIComponent(city)}&doctorId=${doctor.id}`);
  };

  return (
    <main className="container py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doctors in {city}</h1>
          <p className="text-sm text-muted-foreground">Verified psychologists and psychiatrists</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Specialty</label>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={specialty}
            onChange={(e) => {
              setSpecialty(e.target.value);
              const p = new URLSearchParams(location.search);
              p.set("specialty", e.target.value);
              navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
            }}
          >
            <option>All</option>
            <option>Psychologist</option>
            <option>Psychiatrist</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div className="col-span-full text-sm text-muted-foreground">Loading doctors…</div>}
        {!loading && doctors.map((d) => (
          <DoctorCard key={d.id} doctor={d} onBook={handleBook} />))}
        {!loading && doctors.length === 0 && (
          <div className="col-span-full rounded-xl border p-8 text-center text-muted-foreground">
            No doctors found for the selected filters.
          </div>
        )}
      </div>
    </main>
  );
}
