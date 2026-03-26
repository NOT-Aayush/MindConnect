export type Slot = {
  start: string; // ISO time
  end: string; // ISO time
};

export type Doctor = {
  id: string;
  name: string;
  city: string;
  specialty: "Psychologist" | "Psychiatrist";
  experienceYears: number;
  background: string;
  college: string;
  phone: string;
  feesINR: number;
  languages: string[];
  rating: number;
  avatarUrl?: string;
  freeSlots: Slot[]; // upcoming 14-day rolling window
};

// Seed sample data; in real app this would come from your backend/admin upload
export const doctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Aisha Mehra",
    city: "Delhi",
    specialty: "Psychiatrist",
    experienceYears: 12,
    background:
      "MD Psychiatry, AIIMS. Specializes in mood disorders, anxiety, and medication management with a holistic, trauma‑informed approach.",
    college: "AIIMS, New Delhi",
    phone: "+91-9810010101",
    feesINR: 1500,
    languages: ["English", "Hindi"],
    rating: 4.8,
    avatarUrl:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-2",
    name: "Rahul Verma",
    city: "Mumbai",
    specialty: "Psychologist",
    experienceYears: 8,
    background:
      "M.Phil Clinical Psychology, TISS. CBT/ACT therapist focusing on stress, sleep, and workplace burnout.",
    college: "TISS, Mumbai",
    phone: "+91-9820020202",
    feesINR: 1000,
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.6,
    avatarUrl:
      "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-3",
    name: "Dr. Nandini Rao",
    city: "Bengaluru",
    specialty: "Psychiatrist",
    experienceYears: 10,
    background:
      "MD Psychiatry, NIMHANS. Expertise in adolescent mental health, ADHD, and neurodiversity‑affirming care.",
    college: "NIMHANS, Bengaluru",
    phone: "+91-9840030303",
    feesINR: 1300,
    languages: ["English", "Kannada", "Hindi"],
    rating: 4.9,
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-4",
    name: "Priya Sharma",
    city: "Delhi",
    specialty: "Psychologist",
    experienceYears: 6,
    background:
      "M.A. Counselling Psychology, DU. Works with trauma, relationships, and grief using EMDR and somatic techniques.",
    college: "University of Delhi",
    phone: "+91-9870040404",
    feesINR: 900,
    languages: ["English", "Hindi"],
    rating: 4.7,
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-5",
    name: "Dr. Vikram Singh",
    city: "Delhi",
    specialty: "Psychiatrist",
    experienceYears: 15,
    background: "Consultant Psychiatrist with experience in mood disorders and OCD treatment.",
    college: "King George's Medical University",
    phone: "+91-9760050505",
    feesINR: 1800,
    languages: ["English", "Hindi"],
    rating: 4.9,
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-6",
    name: "Anita Desai",
    city: "Mumbai",
    specialty: "Psychologist",
    experienceYears: 7,
    background: "Clinical psychologist focusing on couples therapy and relationship issues.",
    college: "SNDT Women’s University",
    phone: "+91-9830060606",
    feesINR: 1100,
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.5,
    avatarUrl: "https://images.unsplash.com/photo-1545996124-1b1a9eea0f8f?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-7",
    name: "Dr. Suresh Patel",
    city: "Pune",
    specialty: "Psychiatrist",
    experienceYears: 9,
    background: "Expert in adolescent psychiatry and sleep disorders.",
    college: "Seth GS Medical College",
    phone: "+91-9820070707",
    feesINR: 1200,
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.6,
    avatarUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-8",
    name: "Meera Iyer",
    city: "Chennai",
    specialty: "Psychologist",
    experienceYears: 11,
    background: "Counseling psychologist working with grief and trauma.",
    college: "Madras School of Social Work",
    phone: "+91-9840080808",
    feesINR: 1000,
    languages: ["English", "Tamil"],
    rating: 4.7,
    avatarUrl: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-9",
    name: "Dr. Rajesh Kumar",
    city: "Kolkata",
    specialty: "Psychiatrist",
    experienceYears: 13,
    background: "MD Psychiatry; experienced in substance use disorders and mood stabilization.",
    college: "IPGMER, Kolkata",
    phone: "+91-9870090909",
    feesINR: 1400,
    languages: ["English", "Bengali"],
    rating: 4.6,
    avatarUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-10",
    name: "Sana Mir",
    city: "Bengaluru",
    specialty: "Psychologist",
    experienceYears: 5,
    background: "CBT therapist focusing on anxiety and performance coaching.",
    college: "Christ University",
    phone: "+91-9900011010",
    feesINR: 950,
    languages: ["English", "Kannada"],
    rating: 4.4,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-11",
    name: "Dr. Kavita Rao",
    city: "Hyderabad",
    specialty: "Psychiatrist",
    experienceYears: 14,
    background: "Psychiatrist with expertise in geriatric mental health and neurocognitive disorders.",
    college: "Osmania Medical College",
    phone: "+91-9880021112",
    feesINR: 1600,
    languages: ["English", "Telugu"],
    rating: 4.7,
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-12",
    name: "Rohit Malhotra",
    city: "Chandigarh",
    specialty: "Psychologist",
    experienceYears: 4,
    background: "Counseling for young professionals, career anxiety and motivation issues.",
    college: "Panjab University",
    phone: "+91-9810021213",
    feesINR: 800,
    languages: ["English", "Hindi"],
    rating: 4.3,
    avatarUrl: "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-13",
    name: "Dr. Leena Gupta",
    city: "Lucknow",
    specialty: "Psychiatrist",
    experienceYears: 11,
    background: "Experienced in women's mental health and perinatal psychiatry.",
    college: "King George's Medical University",
    phone: "+91-9840031314",
    feesINR: 1450,
    languages: ["English", "Hindi"],
    rating: 4.8,
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-14",
    name: "Sunita Rao",
    city: "Ahmedabad",
    specialty: "Psychologist",
    experienceYears: 9,
    background: "Focus on family therapy and adolescent counselling.",
    college: "Gujarat University",
    phone: "+91-9760041415",
    feesINR: 1050,
    languages: ["English", "Gujarati"],
    rating: 4.5,
    avatarUrl: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-15",
    name: "Dr. Manoj Deshmukh",
    city: "Nashik",
    specialty: "Psychiatrist",
    experienceYears: 16,
    background: "Consultant psychiatrist with a focus on mood disorders and psychopharmacology.",
    college: "KEM Hospital, Mumbai",
    phone: "+91-9870051516",
    feesINR: 1700,
    languages: ["English", "Marathi"],
    rating: 4.9,
    avatarUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-16",
    name: "Neha Kapoor",
    city: "Dehradun",
    specialty: "Psychologist",
    experienceYears: 3,
    background: "Therapist working with adolescents, social anxiety, and exam stress.",
    college: "Doon University",
    phone: "+91-9800061617",
    feesINR: 700,
    languages: ["English", "Hindi"],
    rating: 4.2,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-17",
    name: "Dr. Arjun Patel",
    city: "Vadodara",
    specialty: "Psychiatrist",
    experienceYears: 12,
    background: "Special interest in dual diagnosis and addiction psychiatry.",
    college: "Baroda Medical College",
    phone: "+91-9890071718",
    feesINR: 1500,
    languages: ["English", "Gujarati"],
    rating: 4.6,
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-18",
    name: "Priyanka Joshi",
    city: "Bhopal",
    specialty: "Psychologist",
    experienceYears: 8,
    background: "Counseling for trauma recovery and resilience building.",
    college: "Barkatullah University",
    phone: "+91-9870081819",
    feesINR: 950,
    languages: ["English", "Hindi"],
    rating: 4.5,
    avatarUrl: "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-19",
    name: "Dr. Sameer Khan",
    city: "Patna",
    specialty: "Psychiatrist",
    experienceYears: 10,
    background: "Experienced in child and adolescent psychiatry.",
    college: "Patna Medical College",
    phone: "+91-9760091920",
    feesINR: 1250,
    languages: ["English", "Hindi"],
    rating: 4.6,
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
  {
    id: "doc-20",
    name: "Anjali Menon",
    city: "Kochi",
    specialty: "Psychologist",
    experienceYears: 7,
    background: "Focus on mindfulness-based therapies and stress reduction.",
    college: "Mahatma Gandhi University",
    phone: "+91-9840012021",
    feesINR: 1100,
    languages: ["English", "Malayalam"],
    rating: 4.7,
    avatarUrl: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=512&auto=format&fit=crop",
    freeSlots: [],
  },
];

// Utility: generate 14-day rolling availability window with 1h slots
export function generateSlots(days = 14, hours = [10, 12, 15, 18]): Slot[] {
  const out: Slot[] = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    for (const h of hours) {
      const start = new Date(day);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      if (start > now) {
        out.push({ start: start.toISOString(), end: end.toISOString() });
      }
    }
  }
  return out;
}

// Initialize freeSlots on module load so SSR/build remains deterministic
for (const doc of doctors) {
  if (!doc.freeSlots || doc.freeSlots.length === 0) {
    doc.freeSlots = generateSlots();
  }
}
