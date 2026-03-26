export type Review = {
  id: string;
  doctorId: string;
  author?: string;
  rating: number;
  text?: string;
  createdAt: string;
};

const LS_KEY = "mc_reviews_v1";

export function getReviewsForDoctor(docId: string): Review[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Review[];
    return all.filter((r) => r.doctorId === docId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function addReview(r: Omit<Review, "id" | "createdAt"> & { author?: string; text?: string }) {
  const review: Review = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...r } as Review;
  const raw = localStorage.getItem(LS_KEY);
  const all = raw ? (JSON.parse(raw) as Review[]) : [];
  all.push(review);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  return review;
}
