import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReviewsForDoctor, addReview } from "@/lib/reviews";
import { doctors as staticDoctors } from "@/data/doctors";

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<any | null>(null);
  const [reviews, setReviews] = useState(() => (id ? getReviewsForDoctor(id) : []));
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/doctors/${id}`);
        if (res.ok && (res.headers.get('content-type')||'').includes('application/json')) {
          const j = await res.json();
          setDoctor(j.doctor);
        } else {
          // try local storage fallback
          const raw = localStorage.getItem('mc_doctors_v1');
          if (raw) {
            const docs = JSON.parse(raw);
            setDoctor(docs.find((d: any) => d.id === id) || null);
          } else {
            // fallback to static seeded doctors bundled with the client
            const fromFile = staticDoctors.find((d: any) => d.id === id);
            if (fromFile) setDoctor(fromFile);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    addReview({ doctorId: id, rating, text, author: 'Anonymous' });
    setReviews(getReviewsForDoctor(id));
    setText('');
  }

  if (!doctor) return <main className="container py-8">Loading doctor…</main>;

  return (
    <main className="container py-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border p-6 bg-card">
          <div className="flex items-start gap-4">
            <img
              src={doctor.avatarUrl ?? "/placeholder.svg"}
              className="h-24 w-24 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold">{doctor.name}</h1>
              <p className="text-sm text-muted-foreground">
                {doctor.specialty} • {doctor.experienceYears} yrs • {doctor.college ?? "—"}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Contact:</span> {doctor.phone ?? "—"}
              </p>
              <p className="mt-3 text-sm">{doctor.background}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-lg font-bold">₹{doctor.feesINR}</div>
              <button onClick={() => navigate(`/appointments?city=${encodeURIComponent(doctor.city)}&doctorId=${doctor.id}`)} className="mt-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Book Appointment</button>
            </div>
          </div>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Available Slots</h3>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(doctor.freeSlots||[]).slice(0,24).map((s:any)=> (
                <div key={s.start} className="rounded-md border px-3 py-2 text-sm">{new Date(s.start).toLocaleString()}</div>
              ))}
              {(doctor.freeSlots||[]).length===0 && <div className="text-sm text-muted-foreground">No slots available.</div>}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border p-4 bg-card">
          <h3 className="font-semibold">Reviews</h3>
          <div className="mt-3 space-y-3">
            {reviews.length===0 && <div className="text-sm text-muted-foreground">No reviews yet.</div>}
            {reviews.map(r=> (
              <div key={r.id} className="text-sm">
                <div className="font-semibold">{r.author}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="mt-1">{r.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="mt-4 grid gap-2">
            <select value={rating} onChange={(e)=>setRating(Number(e.target.value))} className="rounded-md border px-2 py-1 text-sm w-24">
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>
            <textarea value={text} onChange={(e)=>setText(e.target.value)} className="rounded-md border px-2 py-1 text-sm" placeholder="Share your experience (optional)" />
            <div className="flex justify-end">
              <button className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">Add review</button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
