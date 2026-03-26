import { useLocation, useNavigate, useParams } from "react-router-dom";

const CONTENT: Record<string,string> = {
  therapy: `Therapy helps people explore thoughts, feelings, and behavior with a trained professional. Sessions are collaborative and evidence-based.`,
  psychiatry: `Psychiatry focuses on diagnosis and medical management of mental health conditions, often combining therapy with medication when needed.`,
  adhd: `ADHD is a neurodevelopmental condition that affects attention, executive function, and activity levels. Treatment includes behavioral strategies and sometimes medication.`,
  cancer: `Cancer care integrates psychological support for patients navigating diagnosis, treatment, and survivorship.`,
  personality: `Personality disorders require structured therapy approaches such as DBT and long-term support.`,
  gift: `Gift Therapy - creative interventions tailored to individual needs.`,
  couples: `Couples therapy focuses on relationship patterns, communication, and conflict resolution.`,
};

export default function MentalOptionPage(){
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const key = (slug||'').toLowerCase();
  const content = CONTENT[key] || "Information coming soon.";
  const q = new URLSearchParams(location.search);
  const city = q.get("city") || "Delhi";
  const specialty =
    key === "psychiatry" || key === "adhd" || key === "personality"
      ? "Psychiatrist"
      : "Psychologist";

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold mb-4">{(slug||'').replace('-', ' ')}</h1>
      <p className="text-sm text-muted-foreground">{content}</p>
      <div className="mt-4">
        <button
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() =>
            navigate(`/doctors?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`)
          }
        >
          Find a specialist
        </button>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Suggested resources</h3>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
          <li>Read about evidence-based treatments</li>
          <li>Find a specialist in your city</li>
          <li>Try a short self-assessment</li>
        </ul>
      </div>
    </main>
  );
}
