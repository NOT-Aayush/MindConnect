import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, Stethoscope, CalendarDays, Phone, Brain, BookOpen, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";

const routes = [
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/free-listeners", label: "Free Listeners", icon: Phone },
  { to: "/ai-counselor", label: "AI Counselor", icon: Brain },
  { to: "/#blog", label: "Blog", icon: BookOpen },
];

const mentalItems = ["Therapy","Psychiatry","ADHD","Cancer Care","Personality Disorder","Gift Therapy","Couple's Therapy"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => setMounted(true), []);

  const cityFromUrl = useMemo(() => new URLSearchParams(location.search).get("city") ?? "Delhi", [location.search]);
  const [city, setCity] = useState(cityFromUrl);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    p.set("city", city);
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
  }, [city]);

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="border-b border-border/60">
        <div className="container flex h-20 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <span className="text-2xl font-semibold" style={{ fontFamily: "var(--heading-font)" }}>MindConnect</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-4">
              <NavItem label="Mental Health" items={mentalItems} />
              {routes.map((r) => (
                <NavLink
                  key={r.to}
                  to={r.to}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-3 text-sm font-medium flex items-center gap-2",
                      isActive && "text-primary",
                    )
                  }
                >
                  <r.icon className="h-4 w-4" /> {r.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <CitySelect value={city} onChange={setCity} />
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:inline-flex items-center justify-center rounded-md border px-3 py-2 hover:bg-muted/60"
            >
              {/* Avoid SSR hydration mismatches by only reading theme after mount */}
              {mounted && (theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)}
            </button>
            <UserMenu />
            <button className="lg:hidden inline-flex items-center justify-center rounded-md border px-3 py-2 hover:bg-muted/70" onClick={() => setOpen((v) => !v)} aria-label="Open Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="container grid py-3">
            <div className="py-1 px-2">
            <div className="text-xs text-muted-foreground px-3 py-2">Mental Health</div>
            {mentalItems.map((it) => {
              const slug = it.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return (
                <Link
                  key={it}
                  to={`/mental/${slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted/60"
                >
                  {it}
                </Link>
              );
            })}
          </div>
          {routes.map((r) => (
              <NavLink key={r.to} to={r.to} className={({ isActive }) => cn("px-3 py-2 rounded-md text-sm font-medium hover:bg-muted/60 transition-colors flex items-center gap-2", isActive && "bg-muted/70 text-primary")}>
                <r.icon className="h-4 w-4" /> {r.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ label, items }: { label: string; items?: string[] }) {
  const [openMenu, setOpenMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = wrapperRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && el.contains(target)) return;
      setOpenMenu(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu((v) => !v)}
        aria-expanded={openMenu}
        className="px-4 py-3 text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors"
      >
        {label}
      </button>
      {items && openMenu && (
        <div className="absolute left-0 mt-2 w-56 rounded-md bg-background border border-border/60 shadow-lg z-50 mega-dropdown">
          <div className="p-3">
            {items.map((it) => {
              const slug = it.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return (
                <a
                  key={it}
                  href={`/mental/${slug}`}
                  className="block px-3 py-2 text-sm text-foreground hover:bg-muted/60 rounded"
                >
                  {it}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cities = ["Delhi", "Mumbai", "Bengaluru", "Pune", "Kolkata", "Chennai"];
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Select city</span>
      <select
        className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  function openSignIn() {
    window.dispatchEvent(new CustomEvent('mc:open-signin'));
  }

  if (!user) {
    return (
      <div className="flex items-center">
        <button onClick={openSignIn} className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted/60 transition-colors">Sign in</button>
      </div>
    );
  }

  const initials = (user.name || "U").split(" ").map(s => s[0]).slice(0,2).join("");

  return (
    <div className="relative">
      <button onClick={() => setOpenMenu(v => !v)} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 hover:bg-muted/60 transition-colors">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{initials}</div>
        <span className="hidden md:inline text-sm">{user.name}</span>
      </button>
      {openMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-background shadow-lg p-2 z-50 border border-border/60">
          <div className="px-3 py-2 text-xs text-muted-foreground">{user.email}</div>
          <div className="border-t my-1" />
          <button onClick={() => { navigate('/profile'); setOpenMenu(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted/60">Profile</button>
          <button onClick={() => { navigate('/appointments'); setOpenMenu(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted/60">My Bookings</button>
          {user.role === 'ADMIN' && (
            <button onClick={() => { navigate('/add-doctor'); setOpenMenu(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted/60">Add Doctor</button>
          )}
          {user.role === 'DOCTOR' && (
            <button onClick={() => { navigate('/profile'); setOpenMenu(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted/60">Manage Profile</button>
          )}
          <div className="border-t my-1" />
          <button onClick={() => { logout(); navigate('/'); setOpenMenu(false); }} className="block w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted/60">Logout</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;
