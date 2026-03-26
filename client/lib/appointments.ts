import type { Doctor, Slot } from "@/data/doctors";

export type Booking = {
  id: string;
  doctorId: string;
  doctorName: string;
  city: string;
  slot: Slot;
  createdAt: string;
};

const LS_KEY = "mindconnect.bookings";

export function getBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

export function saveBookings(b: Booking[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(b));
}

export function addBooking(doctor: Doctor, slot: Slot): Booking {
  const booking: Booking = {
    id: crypto.randomUUID(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    city: doctor.city,
    slot,
    createdAt: new Date().toISOString(),
  };
  const all = getBookings();
  all.push(booking);
  saveBookings(all);
  return booking;
}

export function cancelBooking(id: string) {
  const all = getBookings().filter((b) => b.id !== id);
  saveBookings(all);
}
