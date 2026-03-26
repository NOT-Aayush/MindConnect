import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, fetchWithAuth, refreshUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<{ users: number; doctors: number; bookings: number } | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorsByCity, setDoctorsByCity] = useState<Record<string, number>>({});

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [cityDraft, setCityDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const res = await fetchWithAuth("/api/bookings");
        if (!res.ok) {
          const t = await res.text();
          console.error('/api/bookings error:', t.slice(0,200));
          return;
        }
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          setBookings(json.bookings || []);
        } else {
          const t = await res.text();
          console.error('/api/bookings returned non-json:', t.slice(0,200));
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [user, fetchWithAuth]);

  useEffect(() => {
    if (!user) return;
    setNameDraft(user.name ?? "");
    setCityDraft(user.city ?? "");
    setPhoneDraft(user.phone ?? "");
  }, [user]);

  useEffect(() => {
    async function loadAdmin() {
      if (!user || user.role !== "ADMIN") return;
      try {
        const [statsRes, usersRes, bookingsRes, doctorsRes] = await Promise.all([
          fetchWithAuth("/api/admin/stats"),
          fetchWithAuth("/api/admin/users"),
          fetchWithAuth("/api/admin/bookings"),
          fetch("/api/doctors"),
        ]);

        if (statsRes.ok) {
          const json = await statsRes.json();
          setAdminStats(json.stats ?? null);
        }
        if (usersRes.ok) {
          const json = await usersRes.json();
          setAdminUsers(json.users ?? []);
        }
        if (bookingsRes.ok) {
          const json = await bookingsRes.json();
          setAdminBookings(json.bookings ?? []);
        }
        if (doctorsRes.ok) {
          const json = await doctorsRes.json();
          const doctorsData = json.doctors ?? [];
          setDoctors(doctorsData);
          
          // Calculate city-wise distribution
          const cityDistribution = doctorsData.reduce((acc: Record<string, number>, doctor: any) => {
            acc[doctor.city] = (acc[doctor.city] || 0) + 1;
            return acc;
          }, {});
          setDoctorsByCity(cityDistribution);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadAdmin();
  }, [user, fetchWithAuth]);

  if (!user) return <div className="container py-12">Please sign in to view your profile.</div>;

  async function saveProfile() {
    const payload: any = {};
    if (nameDraft !== user.name) payload.name = nameDraft;
    if (cityDraft !== (user.city ?? "")) payload.city = cityDraft;
    if (phoneDraft !== (user.phone ?? "")) payload.phone = phoneDraft;

    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    const res = await fetchWithAuth("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      alert(t || "Failed to update profile");
      return;
    }

    await refreshUser();
    setEditing(false);
  }

  async function deleteDoctor(doctorId: string) {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    
    try {
      const res = await fetchWithAuth("/api/doctors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctorId }),
      });
      
      if (res.ok) {
        const deletedDoctor = doctors.find(d => d.id === doctorId);
        setDoctors(doctors.filter(d => d.id !== doctorId));
        
        // Update city distribution
        if (deletedDoctor) {
          setDoctorsByCity(prev => {
            const newDist = { ...prev };
            newDist[deletedDoctor.city] = (newDist[deletedDoctor.city] || 0) - 1;
            if (newDist[deletedDoctor.city] <= 0) {
              delete newDist[deletedDoctor.city];
            }
            return newDist;
          });
        }
        
        // Also refresh admin stats to update doctor count
        if (adminStats) {
          setAdminStats(prev => prev ? { ...prev, doctors: prev.doctors - 1 } : null);
        }
        alert("Doctor deleted successfully");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete doctor");
      }
    } catch (error) {
      console.error("Delete doctor error:", error);
      alert("Failed to delete doctor");
    }
  }

  return (
    <main className="container py-12">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your info</h2>
              <p className="text-sm text-muted-foreground">Role: {user.role}</p>
            </div>
            {!editing && (
              <button
                className="rounded-md border px-3 py-1 text-sm hover:bg-muted/60"
                onClick={() => setEditing(true)}
                type="button"
              >
                Edit
              </button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-3">{user.email}</p>

          {!editing ? (
            <>
              <p className="mt-2 text-sm font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.city ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{user.phone ?? "—"}</p>
            </>
          ) : (
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                Name
                <input
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                City
                <input
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={cityDraft}
                  onChange={(e) => setCityDraft(e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Phone (optional)
                <input
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                />
              </label>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-muted/60"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  onClick={saveProfile}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
        {user.role === "ADMIN" ? (
          <div className="md:col-span-2 rounded-xl border bg-card p-5 space-y-6">
            <div>
              <h2 className="font-semibold">Admin dashboard</h2>
              <p className="text-sm text-muted-foreground">Overview of users, doctors and bookings</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-background p-3">
                <div className="text-xs text-muted-foreground">Users</div>
                <div className="text-2xl font-bold">{adminStats?.users ?? "—"}</div>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <div className="text-xs text-muted-foreground">Doctors</div>
                <div className="text-2xl font-bold">{adminStats?.doctors ?? "—"}</div>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <div className="text-xs text-muted-foreground">Bookings</div>
                <div className="text-2xl font-bold">{adminStats?.bookings ?? "—"}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Recent bookings</h3>
              <ul className="mt-3 space-y-3">
                {adminBookings.slice(0, 10).map((b) => (
                  <li key={b.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {b.user?.name ?? "Unknown patient"} → {b.doctor?.name ?? "Unknown doctor"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.slotStart).toLocaleString()} • {b.doctor?.city ?? "—"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                {adminBookings.length === 0 && (
                  <li className="text-sm text-muted-foreground">No bookings yet.</li>
                )}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Users</h3>
                <a
                  href="/add-doctor"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Add doctor
                </a>
              </div>
              <ul className="mt-3 space-y-2">
                {adminUsers.slice(0, 8).map((u) => (
                  <li key={u.id} className="rounded-md border p-3">
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.email} • {u.role} {u.city ? `• ${u.city}` : ""}
                    </div>
                  </li>
                ))}
                {adminUsers.length === 0 && (
                  <li className="text-sm text-muted-foreground">No users yet.</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Manage Doctors</h3>
              
              {/* City-wise Distribution */}
              <div className="mt-3 mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">City Distribution</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(doctorsByCity).length === 0 ? (
                    <span className="text-xs text-muted-foreground">No doctors available</span>
                  ) : (
                    Object.entries(doctorsByCity).map(([city, count]) => (
                      <div key={city} className="rounded-md bg-muted px-2 py-1 text-xs">
                        {city}: {count}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Doctors List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {doctors.slice(0, 10).map((doctor) => (
                  <div key={doctor.id} className="rounded-md border border-border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{doctor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doctor.specialty} • {doctor.city} • ⭐ {doctor.rating}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ₹{doctor.feesINR} • {doctor.experienceYears} years exp
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDoctor(doctor.id)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 text-sm px-2 py-1 rounded border border-border transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {doctors.length === 0 && (
                  <div className="text-sm text-muted-foreground">No doctors yet.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 rounded-xl border bg-card p-5">
            <h2 className="font-semibold">Your bookings</h2>
            <ul className="mt-3 space-y-3">
              {bookings.map((b) => (
                <li key={b.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(b.slotStart).toLocaleString()}</p>
                    </div>
                  </div>
                </li>
              ))}
              {bookings.length === 0 && <div className="text-sm text-muted-foreground">No bookings yet.</div>}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
