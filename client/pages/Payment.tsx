import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PaymentPage() {
  const q = useQuery();
  const bookingId = q.get("bookingId");
  const { fetchWithAuth } = useAuth();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/bookings");
        if (res.ok && (res.headers.get("content-type")||"").includes("application/json")) {
          const json = await res.json();
          const b = (json.bookings || []).find((x: any) => x.id === bookingId);
          setBooking(b || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  async function complete() {
    // simulate payment success
    alert("Payment simulated. Booking confirmed.");
    navigate('/profile');
  }

  if (loading) return <main className="container py-8">Loading payment...</main>;

  return (
    <main className="container py-8">
      <div className="mx-auto max-w-xl rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">Payment</h1>
        {!booking && <p className="text-sm text-muted-foreground mt-2">Booking not found or you must be signed in.</p>}
        {booking && (
          <div className="mt-4">
            <p className="text-sm">Doctor: {booking.doctor?.name}</p>
            <p className="text-sm">When: {new Date(booking.slotStart).toLocaleString()}</p>
            <p className="text-sm">
              Amount: ₹{booking.doctor?.feesINR ?? "1500"}
            </p>
            <div className="mt-4 flex justify-end">
              <button onClick={complete} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Complete Payment</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
