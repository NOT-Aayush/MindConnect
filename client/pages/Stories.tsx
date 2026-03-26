import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StoriesPage() {
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [doctorsRes, blogsRes] = await Promise.all([
          fetch('/api/doctors'),
          fetch('/api/blogs'),
        ]);

        if (doctorsRes.ok) {
          const doctorsJson = await doctorsRes.json();
          setTopDoctors(doctorsJson.doctors?.slice(0, 3) || []);
        }

        if (blogsRes.ok) {
          const blogsJson = await blogsRes.json();
          setBlogPosts(blogsJson.blogs || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleBook = (doctor: any) => {
    navigate(`/doctors?city=${encodeURIComponent(doctor.city)}#doctor-${doctor.id}`);
  };

  return (
    <main className="container py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Stories & Insights</h1>
        <p className="text-sm text-muted-foreground mt-2">Articles from psychologists and lived experiences</p>
      </header>

      {/* Top Doctors Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Top Rated Doctors</h2>
          <p className="text-sm text-muted-foreground mt-2">Highly-rated mental health professionals</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {topDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-card dark:bg-card rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                {doctor.avatarUrl && (
                  <img src={doctor.avatarUrl} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                )}
                <div>
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground">{doctor.city}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {doctor.experienceYears} years exp.
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Fees: ₹{doctor.feesINR}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Languages: {doctor.languages}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleBook(doctor)}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-sm text-muted-foreground">Loading stories...</div>
        ) : blogPosts.length === 0 ? (
          <div className="col-span-full text-center text-sm text-muted-foreground">No stories available yet.</div>
        ) : (
          blogPosts.map((b) => (
            <article key={b.id} className="bg-card rounded-lg shadow-md overflow-hidden">
              {b.cover && (
                <div className="h-48 w-full overflow-hidden">
                  <img src={b.cover} alt={b.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <p className="text-xs text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString()} • {b.role}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{b.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-4">{b.excerpt}</p>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="mt-12">
        <div className="rounded-lg bg-gradient-to-r from-amber-50 to-pink-50 p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Featured Stories</h2>
            <p className="text-sm text-muted-foreground mt-2">Curated reflections and professional guidance</p>
          </div>
          <img src="https://cdn.builder.io/api/v1/image/assets%2F2625df872b2144e98726450082600d42%2F898ce96adb6e4d87a6337a6e30d3a54d?format=webp&width=800" className="h-40 rounded-md object-cover" />
        </div>
      </section>
    </main>
  );
}
