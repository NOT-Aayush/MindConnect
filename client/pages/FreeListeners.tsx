import { useMemo, useState } from "react";
import { Phone, Shield, Users } from "lucide-react";
import { useLiveListeners } from "@/hooks/use-live-listeners";

const coordinator = import.meta.env.VITE_WHATSAPP_COORDINATOR as string | undefined;

export default function FreeListenersPage() {
  const [topic, setTopic] = useState("General support");
  const [room, setRoom] = useState<string | null>(null);
  const live = useLiveListeners();

  const waLink = useMemo(() => {
    if (!coordinator || !room) return null;
    const text = encodeURIComponent(
      `Hello, I'd like to be connected anonymously to a free listener. Room: ${room}. Topic: ${topic}`,
    );
    const phone = coordinator.replace(/[^\d]/g, "");
    return `https://wa.me/${phone}?text=${text}`;
  }, [room, topic]);

  function startMatch() {
    setRoom("mc-" + Math.random().toString(36).slice(2, 8));
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold">Free Listeners</h1>
      <p className="text-sm text-muted-foreground">Connect with a peer listener for a free, anonymous chat or call.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border p-5 bg-card md:col-span-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Start an Anonymous Session</h2>
            <div className="ml-auto text-sm text-muted-foreground">{live.count} listeners ready</div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We connect you to a peer listener now. Conversations are anonymous and peer‑led.
          </p>

          <div className="mt-4 grid gap-3">
            <label className="text-sm">Topic (optional)</label>
            <input
              type="text"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Anxiety, stress, relationships..."
            />
            <div className="flex gap-2">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onClick={startMatch}>
                Generate Anonymous Room
              </button>
              {room && (
                <span className="inline-flex items-center rounded-md border px-3 py-2 text-xs">Room: {room}</span>
              )}
            </div>

            {room && (
              <div className="rounded-md border p-3 text-sm">
                {!coordinator ? (
                  <p className="text-muted-foreground">
                    Coordinator not configured. Share the room code or configure VITE_WHATSAPP_COORDINATOR to enable WhatsApp relay.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    <p className="text-muted-foreground">Open WhatsApp with a prefilled anonymous request.</p>
                    <a
                      href={waLink ?? "#"}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                      rel="noreferrer"
                    >
                      <Phone className="h-4 w-4" /> Open WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-xl border p-5 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <h3 className="font-semibold">Listeners online</h3>
          <p className="text-sm text-muted-foreground">People ready to listen now</p>
          <div className="mt-3 space-y-2">
            {live.list.length === 0 && <div className="text-sm text-muted-foreground">No listeners available right now.</div>}
            {live.list.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted/60 dark:bg-muted/20 flex items-center justify-center">{l[0]}</div>
                <div>
                  <div className="text-sm font-medium">Anonymous</div>
                  <div className="text-xs text-muted-foreground">{l}</div>
                </div>
                <div className="ml-auto text-xs text-primary">Connect</div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">Safety: No exchange of personal numbers. Not a crisis service.</div>
        </aside>
      </div>
    </main>
  );
}
