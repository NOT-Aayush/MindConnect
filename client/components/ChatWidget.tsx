import { useEffect, useMemo, useState } from "react";

export default function ChatWidget({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi — I'm MindBot. I can ask a few questions to understand how you're feeling. Would you like to start?" },
  ]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState(0);

  const questions = useMemo(() => [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Feeling nervous, anxious, or on edge?",
    "Trouble sleeping?",
    "Trouble concentrating?",
  ], []);

  useEffect(() => {
    if (!open && onClose) onClose();
  }, [open]);

  if (!open) return null;

  function send(text: string, from: "bot" | "user" = "user") {
    setMessages((m) => [...m, { from, text }]);
  }

  function handleSend() {
    if (!input.trim()) return;
    send(input, "user");
    const txt = input.toLowerCase();
    setInput("");
    if (stage === 0) {
      // user response to start
      send("Great — I'll ask a few quick questions. Please answer honestly.");
      setTimeout(() => send(questions[0]), 600);
      setStage(1);
      return;
    }

    if (stage > 0 && stage <= questions.length) {
      // store answer as simple positive/negative
      const positive = /yes|often|more|sometimes|nearly|always|1|2|3/.test(txt);
      send(positive ? "Noted." : "Noted.");
      const next = stage + 1;
      if (next <= questions.length) setTimeout(() => send(questions[next - 1]), 600);
      setStage(next);
      if (next > questions.length) {
        setTimeout(() => send("Thanks — based on these answers, you may benefit from a follow-up with a professional. Use the AI Counselor for more assessment or book a session."), 900);
      }
      return;
    }

    // fallback small talk
    setTimeout(() => send("Thanks for sharing. If you'd like, try the questionnaire option for a structured assessment."), 800);
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 w-80">
      <div className="flex items-center justify-between rounded-t-md bg-primary px-3 py-2 text-primary-foreground">
        <div className="text-sm font-semibold">MindBot</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(false)} className="text-sm opacity-90">Close</button>
        </div>
      </div>
      <div className="rounded-b-md border border-border bg-card p-3 shadow-lg">
        <div className="max-h-56 overflow-y-auto space-y-2 mb-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm ${
                m.from === "bot"
                  ? "text-muted-foreground"
                  : "text-primary-foreground bg-primary px-2 py-1 rounded inline-block"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <button onClick={handleSend} className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">Send</button>
        </div>
      </div>
    </div>
  );
}
