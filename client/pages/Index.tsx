import { useLocation, useNavigate } from "react-router-dom";
import DoctorCard from "@/components/DoctorCard";
import { ArrowRight, BookOpen, CalendarDays, Stethoscope, Phone } from "lucide-react";
import { useLiveListeners } from "@/hooks/use-live-listeners";
import { useState, useEffect, useRef } from "react";
import ChatWidget from "@/components/ChatWidget";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const city = params.get("city") ?? "Delhi";

  const live = useLiveListeners();
  const [showAssistant, setShowAssistant] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const coordinator = import.meta.env.VITE_WHATSAPP_COORDINATOR as string | undefined;

  const featured = doctors.filter((d) => d.city === city).slice(0, 3);
  const waAssistLink = (() => {
    if (!coordinator) return null;
    const phone = coordinator.replace(/[^\d]/g, "");
    const text = encodeURIComponent(`Hello, I'd like a guided video call with an assistant to help book appointments.`);
    return `https://wa.me/${phone}?text=${text}`;
  })();

  const parallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [blogsRes, doctorsRes] = await Promise.all([
          fetch('/api/blogs'),
          fetch('/api/doctors'),
        ]);
        
        if (blogsRes.ok) {
          const blogsJson = await blogsRes.json();
          setBlogPosts(blogsJson.blogs || []);
        }
        
        if (doctorsRes.ok) {
          const doctorsJson = await doctorsRes.json();
          setDoctors(doctorsJson.doctors || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;

    let raf = 0;
    const layers = Array.from(el.querySelectorAll<HTMLDivElement>('.parallax-layer'));

    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5);
      const y = ((e.clientY - rect.top) / rect.height - 0.5);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        layers.forEach(layer => {
          const depth = parseFloat(layer.dataset.depth || '0');
          const tx = -x * depth * 40;
          const ty = -y * depth * 30;
          layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
      });
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const sc = window.scrollY || window.pageYOffset;
        layers.forEach(layer => {
          const depth = parseFloat(layer.dataset.depth || '0');
          const ty = (rect.top * depth) * -0.08;
          layer.style.transform = `translate3d(0, ${ty}px, 0)`;
        });
      });
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    // initial
    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  function findDoctors(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const city = String(data.get("city") || "Delhi");
    const specialty = String(data.get("specialty") || "All");
    navigate(`/doctors?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`);
  }

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-100" aria-hidden>
          <div className="parallax h-full w-full" ref={parallaxRef}>
            <div className="parallax-layer bg-1" data-depth="0.15" />
            <div className="parallax-layer bg-2" data-depth="0.35" />
            <div className="parallax-layer bg-3 hero-gradient" data-depth="0.6" />
          </div>
        </div>
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              MindConnect — mental healthcare made warm, easy, and private
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-prose">
              Book trusted psychologists and psychiatrists in your city. Evidence‑based care with flexible online sessions.
            </p>

            <form onSubmit={findDoctors} className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <select name="city" defaultValue={city} className="rounded-md border bg-background px-3 py-3 text-sm">
                {['Delhi','Mumbai','Bengaluru','Pune','Kolkata','Chennai'].map((c) => <option key={c}>{c}</option>)}
              </select>
              <select name="specialty" defaultValue="All" className="rounded-md border bg-background px-3 py-3 text-sm">
                <option>All</option>
                <option>Psychologist</option>
                <option>Psychiatrist</option>
              </select>
              <button className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
                <Stethoscope className="mr-2 h-4 w-4" /> Find Doctors
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href={`/appointments?city=${encodeURIComponent(city)}`} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/60">
                <CalendarDays className="h-4 w-4" /> Appointment Dashboard
              </a>
              <a href="#blog" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/60">
                <BookOpen className="h-4 w-4" /> Read Blogs
              </a>
            </div>

            {/* Assistant Card */}
            <div className="mt-6">
              <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-background p-4 shadow-md flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">Need help? Our Assistant can guide you</h4>
                  <p className="text-sm text-muted-foreground">Video call or chat with a MindConnect assistant who can help book appointments for you — free.</p>
                  <div className="mt-3 flex gap-2">
                    <a href={waAssistLink ?? "#"} id="wa-assist" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white inline-flex items-center gap-2" target="_blank" rel="noreferrer"><Phone className="h-4 w-4" /> Video Call (WhatsApp)</a>
                    <button id="chat-assist" className="rounded-md border px-4 py-2 text-sm" onClick={() => setShowAssistant(true)}>Chat with Assistant</button>
                    <a href={`/appointments?city=${encodeURIComponent(city)}`} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Book for me</a>
                  </div>
                </div>
                <div className="w-36 h-24 rounded-md bg-gradient-to-br from-pink-50 to-amber-50 dark:from-pink-950 dark:to-amber-950 flex items-center justify-center text-muted-foreground">Assistant</div>
              </div>
            </div>
          </div>

          {/* Assessment CTA */}
          <div className="max-w-3xl mx-auto text-center py-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Not sure where to begin?</h2>
            <p className="text-sm text-muted-foreground mb-6">Try our free assessment where we'll ask a series of clinically tested questions to help us understand your needs and emotional state.</p>
            <a href="/ai-counselor" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm text-white">Free Assessment</a>
          </div>

          {/* Three column full-width boxes */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-4 shadow-lg">
              <h3 className="text-lg font-semibold">Featured Professionals</h3>
              <div className="mt-3 grid gap-3">
                {featured.map((d) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <img src={d.avatarUrl} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialty} • {d.experienceYears} yrs</div>
                    </div>
                    <div className="ml-auto text-right text-sm">
                      <div className="font-semibold">₹{d.feesINR}</div>
                      <button onClick={() => navigate(`/appointments?city=${encodeURIComponent(d.city)}&doctorId=${d.id}`)} className="text-xs text-primary underline">Book</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-4 shadow-lg">
              <h3 className="text-lg font-semibold">Live Free Listeners</h3>
              <p className="text-sm text-muted-foreground">People ready to listen now — anonymous and free</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">{live.count}</div>
                <div>
                  <div className="text-sm font-medium">{live.count} listeners available</div>
                  <div className="text-xs text-muted-foreground">{live.list.slice(0,3).join(', ')}{live.list.length>3 ? `, +${live.list.length-3} more` : ''}</div>
                </div>
                <div className="ml-auto">
                  <a href="/free-listeners" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white">Join anonymously</a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-white to-secondary/10 dark:from-card dark:to-secondary/20 p-6 shadow-lg">
              <div className="flex flex-col gap-3">
                <div className="text-sm text-muted-foreground">Confidential online sessions</div>
                <h3 className="text-lg font-semibold">Evidence‑based care, delivered with empathy</h3>
                <p className="text-sm text-muted-foreground">Flexible scheduling • Online & in-person • Multilingual professionals</p>
                <div className="mt-2">
                  <a href="/doctors" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Browse doctors</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assistant chat overlay */}
      {showAssistant && <ChatWidget />}

      <section className="container py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured in {city}</h2>
            <p className="text-sm text-muted-foreground">Top rated professionals near you</p>
          </div>
          <a href={`/doctors?city=${encodeURIComponent(city)}`} className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
            Explore all <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DoctorCard key={d.id} doctor={d} onBook={(doc) => navigate(`/appointments?city=${encodeURIComponent(doc.city)}&doctorId=${doc.id}`)} />
          ))}
        </div>
      </section>

      <section id="blog" className="border-t border-border/60">
        <div className="container py-12">
          <h2 className="text-2xl font-bold">Stories & Insights</h2>
          <p className="text-sm text-muted-foreground">From renowned psychologists and lived experiences</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {blogPosts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No stories available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for mental health insights and articles.</p>
              </div>
            ) : (
              blogPosts.slice(0, 3).map((b) => (
                <article key={b.id} className="rounded-xl border overflow-hidden bg-card">
                  {b.cover && <img src={b.cover} alt="" className="h-40 w-full object-cover" />}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString()} • {b.role}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{b.excerpt}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
