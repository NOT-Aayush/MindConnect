export type Slot = {
  start: string; // ISO time
  end: string; // ISO time
};

export type Doctor = {
  id: string;
  name: string;
  city: string;
  specialty: "Psychologist" | "Psychiatrist";
  experienceYears: number;
  background: string;
  college: string;
  phone: string;
  feesINR: number;
  languages: string[];
  rating: number;
  avatarUrl?: string;
  freeSlots: Slot[]; // upcoming 14-day rolling window
};

// Empty array - all data comes from database
export const doctors: Doctor[] = [];

// Utility: generate 14-day rolling availability window with 1h slots
export function generateSlots(days = 14, hours = [10, 12, 15, 18]): Slot[] {
  const out: Slot[] = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    for (const h of hours) {
      const start = new Date(day);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      if (start > now) {
        out.push({ start: start.toISOString(), end: end.toISOString() });
      }
    }
  }
  return out;
}
