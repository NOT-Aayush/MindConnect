export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="container py-8 grid gap-4 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-inner" />
            <span className="text-xl">MindConnect</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Book trusted psychologists and psychiatrists near you. Confidential, evidence‑based, and human.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-2">Resources</p>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="/ai-counselor" className="hover:text-foreground">AI Counselor</a></li>
            <li><a href="/free-listeners" className="hover:text-foreground">Free Listeners</a></li>
            <li><a href="/appointments" className="hover:text-foreground">Appointments</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-2">Legal</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>Not a crisis service. If in danger, contact local emergency services.</li>
            <li>For informational purposes; not a substitute for professional diagnosis.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container py-4 text-xs text-muted-foreground">© {new Date().getFullYear()} MindConnect</div>
      </div>
    </footer>
  );
}
