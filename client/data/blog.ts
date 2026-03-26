export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  role: "Psychologist" | "Psychiatrist" | "Patient";
  date: string; // ISO
  cover?: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "Understanding Burnout: Signs and Recovery",
    excerpt:
      "Burnout can look like laziness from the outside, but it is a physiological response to chronic stress. Here's how to spot it early and recover.",
    content:
      "Burnout is more than fatigue. It's a depletion of emotional and physical resources...",
    author: "Rahul Verma",
    role: "Psychologist",
    date: new Date().toISOString(),
    cover:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "b2",
    title: "My Journey with Therapy",
    excerpt:
      "Therapy helped me articulate feelings I had buried for years. This is what the first three months looked like for me.",
    content: "I walked into therapy unsure and anxious...",
    author: "A Patient",
    role: "Patient",
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    cover:
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "b3",
    title: "Medication Myths in Mental Health",
    excerpt:
      "There are many misconceptions around psychiatric medication. Let's separate myths from evidence.",
    content: "Medication is one tool among many...",
    author: "Dr. Aisha Mehra",
    role: "Psychiatrist",
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    cover:
      "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1200&auto=format&fit=crop",
  },
];
