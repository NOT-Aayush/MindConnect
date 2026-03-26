import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, IndianRupee, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doctors as staticDoctors } from "@/data/doctors";

export default function AppointmentsPage() {
  const params = new URLSearchParams(useLocation().search);
  const city = params.get("city") ?? "Delhi";
  const doctorId = params.get("doctorId");
  const navigate = useNavigate();

  const { user, fetchWithAuth, token } = useAuth();

  const [doctors, setDoctors] = useState<any[]>([]);
  // Doctors fetched from the backend. These have the real Prisma IDs.
  const [serverDoctors, setServerDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Do not force redirect to login; show appointment UI and allow booking when user signs in via modal

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const docsRes = await fetch(`/api/doctors?city=${encodeURIComponent(city)}`);
        let docsJson: any = {};
        try {
          const ct = docsRes.headers.get("content-type") || "";
          if (ct.includes("application/json")) docsJson = await docsRes.json();
          else {
            const text = await docsRes.text();
            console.error("Expected JSON from /api/doctors, got:", text.slice(0, 200));
            docsJson = {};
          }
        } catch (e) {
          console.error("Failed to parse /api/doctors response", e);
          docsJson = {};
        }
        // merge static seeded doctors first so demo has consistent data
        const serverDocs = docsJson.doctors || [];
        setServerDoctors(serverDocs);
        const fileDocs = staticDoctors.filter(d => !city || d.city === city);
        const merged = [...fileDocs, ...serverDocs];
        setDoctors(merged);
        const sel = doctorId ? merged.find((d: any) => d.id === doctorId) : merged[0];
        // If we have a lightweight doctor without freeSlots, fetch detail
        if (sel && (!sel.freeSlots || sel.freeSlots.length === 0)) {
          try {
            const detRes = await fetch(`/api/doctors/${sel.id}`);
            if (detRes.ok && (detRes.headers.get("content-type") || "").includes("application/json")) {
              const detJson = await detRes.json();
              setSelectedDoctor(detJson.doctor || sel);
            } else {
              setSelectedDoctor(sel);
            }
          } catch (e) {
            console.error("Failed to fetch doctor detail", e);
            setSelectedDoctor(sel);
          }
        } else {
          setSelectedDoctor(sel ?? null);
        }

        if (token) {
          const bRes = await fetchWithAuth("/api/bookings");
          try {
            const ct = bRes.headers.get("content-type") || "";
            if (bRes.ok && ct.includes("application/json")) {
              const bj = await bRes.json();
              setBookings(bj.bookings || []);
            } else {
              const text = await bRes.text();
              console.error("/api/bookings returned non-json or error:", text.slice(0, 200));
            }
          } catch (e) {
            console.error("Failed to parse /api/bookings", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [city, doctorId, token]);

  // If the UI is using a "static" doctor entry (ids like `doc-1`),
  // map it to the matching backend doctor so booking doesn't fail with "Doctor not found".
  const bookingDoctorId = useMemo(() => {
    if (!selectedDoctor) return null;
    if (!serverDoctors || serverDoctors.length === 0) return selectedDoctor.id;
    const exact = serverDoctors.find((d: any) => d.id === selectedDoctor.id);
    if (exact) return exact.id;
    const match = serverDoctors.find(
      (d: any) =>
        d.name === selectedDoctor.name &&
        d.specialty === selectedDoctor.specialty &&
        (!city || d.city === city),
    );
    return match?.id ?? selectedDoctor.id;
  }, [selectedDoctor, serverDoctors, city]);

  async function resolveBookingDoctorId(): Promise<string | null> {
    if (!selectedDoctor) return null;

    // Fast path: if we already mapped to a backend id, use it.
    if (bookingDoctorId && bookingDoctorId !== selectedDoctor.id) return bookingDoctorId;

    // Fallback: re-fetch doctors from backend and map by attributes.
    try {
      const docsRes = await fetch(`/api/doctors?city=${encodeURIComponent(city)}`);
      if (!docsRes.ok) return null;
      const contentType = docsRes.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return null;
      const docsJson = await docsRes.json();
      const serverDocs = docsJson?.doctors ?? [];

      const exact = serverDocs.find((d: any) => d.id === selectedDoctor.id);
      if (exact) return exact.id;

      const match = serverDocs.find(
        (d: any) =>
          d.name === selectedDoctor.name &&
          d.specialty === selectedDoctor.specialty &&
          (!city || d.city === city),
      );
      return match?.id ?? null;
    } catch {
      return null;
    }
  }

  const availableSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    const bookedStarts = new Set(bookings.map((b) => new Date(b.slotStart).toISOString()));
    return (selectedDoctor.freeSlots || []).filter((s: any) => !bookedStarts.has(new Date(s.start).toISOString())).slice(0, 24);
  }, [selectedDoctor, bookings]);

  async function book() {
    if (!selectedDoctor || !selectedSlot) return;
    const resolvedDoctorId = await resolveBookingDoctorId();
    if (!resolvedDoctorId) {
      alert("Unable to book: no matching doctor is available in the database.");
      return;
    }
    try {
      if (!token) {
        // open sign-in modal
        window.dispatchEvent(new CustomEvent('mc:open-signin'));
        return;
      }
      const res = await fetchWithAuth("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: resolvedDoctorId,
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        let j: any = null;
        try { j = JSON.parse(text); } catch { j = { error: text }; }
        alert(j.error || "Booking failed");
        return;
      }
      const j = await res.json();
      setBookings((s) => [...s, j.booking]);
      setSelectedSlot(null);
      // Redirect to payment page (simulated)
      if (j.booking && j.booking.id) {
        navigate(`/payment?bookingId=${encodeURIComponent(j.booking.id)}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function cancel(id: string) {
    try {
      const res = await fetchWithAuth(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) setBookings((b) => b.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <main className="container py-8">Loading…</main>;

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold">Appointment Dashboard</h1>
      <p className="text-sm text-muted-foreground">Book and manage your sessions</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border p-4 bg-card lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <label className="text-sm font-medium">Select Doctor</label>
              <select
                className="mt-1 w-full md:w-80 rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedDoctor?.id ?? ""}
                onChange={(e) => setSelectedDoctor(doctors.find((d) => d.id === e.target.value) ?? null)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>
            {selectedDoctor && (
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><IndianRupee className="h-4 w-4" />{selectedDoctor.feesINR} per session</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Available Slots</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots.map((s: any) => (
                <button
                  key={s.start}
                  className={`rounded-md border px-3 py-2 text-sm hover:bg-muted/60 ${
                    selectedSlot?.start === s.start ? "ring-2 ring-ring" : ""
                  }`}
                  onClick={() => setSelectedSlot(s)}
                >
                  {new Date(s.start).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </button>
              ))}
              {availableSlots.length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground">No slots available.</div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                onClick={book}
                disabled={!selectedDoctor || !selectedSlot}
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Confirm Booking
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-4 bg-card">
          <h2 className="font-semibold">Your Bookings</h2>
          <ul className="mt-3 space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{b.doctorName || b.doctor?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.slotStart || b.slot.start).toLocaleString()} • {b.city || b.doctor?.city}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                    onClick={() => cancel(b.id)}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </li>
            ))}
            {bookings.length === 0 && (
              <li className="text-sm text-muted-foreground">No bookings yet.</li>
            )}
          </ul>
          <div className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p>Bookings are stored locally for demo purposes. Connect a database to persist across devices.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
