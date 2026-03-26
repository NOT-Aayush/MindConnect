import { Doctor } from "@/data/doctors";
import { useEffect, useMemo, useState } from "react";
import { getReviewsForDoctor, addReview } from "@/lib/reviews";

export function DoctorCard({ doctor, onBook }: { doctor: Doctor; onBook?: (d: Doctor) => void }) {
  const [openReviews, setOpenReviews] = useState(false);
  const [reviews, setReviews] = useState(() => getReviewsForDoctor(doctor.id));
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    setReviews(getReviewsForDoctor(doctor.id));
  }, []);

  const avg = useMemo(() => {
    if (reviews.length === 0) return doctor.rating;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) || doctor.rating;
  }, [reviews]);

  function submitReview(e: React.FormEvent) {
    e.preventDefault();
    addReview({ doctorId: doctor.id, rating, text, author: "Anonymous" });
    setReviews(getReviewsForDoctor(doctor.id));
    setText("");
  }

  return (
    <div className="group rounded-2xl overflow-hidden bg-gradient-to-b from-card to-muted shadow-lg transition-transform hover:-translate-y-1">
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={doctor.avatarUrl ?? "/placeholder.svg"}
          alt={doctor.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 bottom-3 rounded-md bg-background/80 backdrop-blur-sm px-3 py-1 text-sm font-semibold">{doctor.specialty}</div>
      </div>
      <div className="p-4 grid gap-2">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">{doctor.name}</h3>
            <p className="text-xs text-muted-foreground">
              {doctor.experienceYears} yrs • {doctor.college ?? "—"}
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm font-bold text-amber-600">{avg.toFixed(1)} ★</div>
            <div className="text-xs text-muted-foreground">₹{doctor.feesINR}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{doctor.background}</p>
        <p className="text-xs text-muted-foreground">Contact: {doctor.phone ?? "—"}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => onBook?.(doctor)} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Book</button>
          <button onClick={() => setOpenReviews((s) => !s)} className="rounded-md border px-3 py-2 text-sm text-muted-foreground">Reviews</button>
        </div>

        {openReviews && (
          <div className="mt-3 border-t pt-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {reviews.length === 0 && <div className="text-sm text-muted-foreground">No reviews yet.</div>}
              {reviews.map((r) => (
                <div key={r.id} className="text-sm">
                  <div className="font-semibold">{r.author}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                  <div className="mt-1">{r.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={submitReview} className="mt-3 grid gap-2">
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded-md border px-2 py-1 text-sm w-24">
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
              <textarea value={text} onChange={(e) => setText(e.target.value)} className="rounded-md border px-2 py-1 text-sm" placeholder="Share your experience (optional)" />
              <div className="flex justify-end">
                <button className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">Add review</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorCard;
