import { useMemo, useState } from "react";
import { Brain, CheckCircle2 } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

const questions = [
  {
    id: "phq1",
    text: "Little interest or pleasure in doing things",
  },
  { id: "phq2", text: "Feeling down, depressed, or hopeless" },
  { id: "gad1", text: "Feeling nervous, anxious, or on edge" },
  { id: "gad2", text: "Not being able to stop or control worrying" },
  { id: "sleep", text: "Trouble falling or staying asleep, or sleeping too much" },
  { id: "focus", text: "Trouble concentrating on things" },
  { id: "energy", text: "Feeling tired or having little energy" },
];

const options = [
  { v: 0, label: "Not at all" },
  { v: 1, label: "Several days" },
  { v: 2, label: "More than half the days" },
  { v: 3, label: "Nearly every day" },
];

export default function AICounselorPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const score = useMemo(() => Object.values(answers).reduce((a, b) => a + b, 0), [answers]);
  const severity = useMemo(() => {
    if (score >= 15) return "Severe";
    if (score >= 10) return "Moderate";
    if (score >= 5) return "Mild";
    return "Minimal";
  }, [score]);

  const likely = useMemo(() => {
    const out: string[] = [];
    const dep = (answers["phq1"] ?? 0) + (answers["phq2"] ?? 0);
    const anx = (answers["gad1"] ?? 0) + (answers["gad2"] ?? 0);
    if (dep >= 3) out.push("Depression symptoms");
    if (anx >= 3) out.push("Anxiety symptoms");
    if ((answers["sleep"] ?? 0) >= 2) out.push("Sleep difficulties");
    if ((answers["focus"] ?? 0) >= 2) out.push("Attention concerns");
    if ((answers["energy"] ?? 0) >= 2) out.push("Low energy / fatigue");
    if (out.length === 0) out.push("No notable concerns detected");
    return out;
  }, [answers]);

  const recommendation = useMemo(() => {
    if (severity === "Severe") return "Therapy recommended; consider psychiatrist evaluation";
    if (severity === "Moderate") return "Therapy recommended";
    if (severity === "Mild") return "Self‑help strategies; therapy optional";
    return "No therapy needed now; monitor and practice self‑care";
  }, [severity]);

  return (
    <main className="container py-8">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Counselor</h1>
      </div>
      <p className="text-sm text-muted-foreground">Answer a few questions; get a personalized recommendation.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border p-5 bg-card md:col-span-2">
          <ol className="space-y-4">
            {questions.map((q) => (
              <li key={q.id} className="grid gap-2">
                <p className="text-sm font-medium">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((o) => (
                    <button
                      key={o.v}
                      className={`rounded-md border px-3 py-2 text-sm hover:bg-muted/60 ${
                        answers[q.id] === o.v ? "ring-2 ring-ring" : ""
                      }`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.v }))}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="rounded-xl border p-5 bg-card">
          <h2 className="font-semibold">Assessment</h2>
          <div className="mt-3 text-sm grid gap-2">
            <div className="flex items-center justify-between"><span>Score</span><span className="font-semibold">{score}</span></div>
            <div className="flex items-center justify-between"><span>Severity</span><span className="font-semibold">{severity}</span></div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Likely concerns</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {likely.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-md bg-muted/60 p-3 text-sm">
            <p className="font-medium">Recommendation</p>
            <p className="text-muted-foreground">{recommendation}</p>
          </div>
          <div className="mt-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <p>Educational guidance only. For diagnosis or risk assessment, consult a licensed professional.</p>
          </div>
        </aside>
      </div>

      {/* Chat counselor appears after answering all questions */}
      {Object.keys(answers).length >= questions.length && (
        <div className="mt-8">
          <ChatCounselor severity={severity} likely={likely} recommendation={recommendation} />
        </div>
      )}
    </main>
  );
}

function ChatCounselor({ severity, likely, recommendation }: { severity: string; likely: string[]; recommendation: string }) {
  const [messages, setMessages] = useState<{ from: 'bot'|'user'; text: string }[]>([
    { from: 'bot', text: `Thanks for completing the assessment. I see: ${likely.join(', ')}.` },
    { from: 'bot', text: `Preliminary suggestion: ${recommendation}. I can chat with you about your next steps.` },
  ]);
  const [input, setInput] = useState('');

  function send(text: string) {
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    // bot response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "Thanks for sharing — I'm here to listen. If you feel overwhelmed or at risk, please contact local emergency services.";
      if (lower.includes('yes') || lower.includes('anx') || lower.includes('sad') || lower.includes('help')) {
        reply = `I hear you. Based on your assessment and what you've said, ${recommendation}. Would you like me to help find available clinicians or book a session for you?`;
      } else if (lower.includes('no') || lower.includes('fine')) {
        reply = `That's good to hear. You might still benefit from some self-care resources. If you'd like, I can suggest exercises or local therapists.`;
      } else {
        reply = `I understand. ${recommendation}. You can ask me to find therapists, show appointments, or explain what therapy involves.`;
      }
      setMessages(m => [...m, { from: 'bot', text: reply }]);
    }, 700);
  }

  return (
    <div className="rounded-xl border p-4 bg-card">
      <h3 className="text-lg font-semibold">Chat with your counselor</h3>
      <div className="mt-3 max-h-60 overflow-y-auto space-y-2 p-2 bg-background/60 dark:bg-muted/20 rounded">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded text-sm ${
              m.from === 'bot'
                ? 'bg-muted/40 text-foreground dark:bg-muted/30'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) send(input.trim()); }} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-md border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
        />
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Send</button>
      </form>
    </div>
  );
}

// Mount ChatWidget
export function AICounselorWithWidget() {
  return (
    <>
      <AICounselorPage />
      <ChatWidget />
    </>
  );
}
