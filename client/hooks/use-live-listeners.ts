import { useEffect, useMemo, useState } from "react";

const NAMES = [
  "Listener A","Listener B","Listener C","Listener D","Listener E","Listener F","Listener G","Listener H","Listener I","Listener J",
];

export function useLiveListeners() {
  const [available, setAvailable] = useState(() => Math.floor(Math.random() * 6) + 2);
  const [list, setList] = useState<string[]>(() => {
    const out: string[] = [];
    const n = Math.max(1, available);
    for (let i = 0; i < n; i++) out.push(NAMES[i % NAMES.length]);
    return out;
  });

  useEffect(() => {
    const t = setInterval(() => {
      const next = Math.max(0, Math.min(12, available + (Math.random() > 0.6 ? 1 : -1)));
      setAvailable(next);
      const out: string[] = [];
      for (let i = 0; i < next; i++) out.push(NAMES[i % NAMES.length] + (Math.random() > 0.6 ? " (voice)" : " (video)"));
      setList(out);
    }, 3500);
    return () => clearInterval(t);
  }, [available]);

  const summary = useMemo(() => ({ count: available, list }), [available, list]);
  return summary;
}
