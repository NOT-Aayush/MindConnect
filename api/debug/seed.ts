import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Create sample doctors
    const sampleDoctors = [
      {
        id: "doc-1",
        name: "Dr. Sarah Johnson",
        city: "Delhi",
        specialty: "Psychologist",
        experienceYears: 8,
        background: "Specialized in cognitive behavioral therapy and anxiety disorders. Has helped over 500 patients overcome mental health challenges.",
        feesINR: 1500,
        languages: "English, Hindi",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-f3b3c229bf6d?w=150&h=150&fit=crop&crop=face",
        rating: 4.8,
      },
      {
        id: "doc-2", 
        name: "Dr. Michael Chen",
        city: "Mumbai",
        specialty: "Psychiatrist",
        experienceYears: 12,
        background: "Expert in mood disorders and medication management. Published researcher in neuropsychiatry.",
        feesINR: 2000,
        languages: "English, Hindi, Mandarin",
        avatarUrl: "https://images.unsplash.com/photo-1612349107341-15d98c6e0c34?w=150&h=150&fit=crop&crop=face",
        rating: 4.9,
      },
      {
        id: "doc-3",
        name: "Dr. Priya Sharma",
        city: "Bengaluru", 
        specialty: "Psychologist",
        experienceYears: 6,
        background: "Focus on trauma therapy and relationship counseling. Uses integrative approach combining multiple therapeutic modalities.",
        feesINR: 1200,
        languages: "English, Hindi, Kannada",
        avatarUrl: "https://images.unsplash.com/photo-1594824475065-5c32c29e0c85?w=150&h=150&fit=crop&crop=face",
        rating: 4.7,
      }
    ];

    // Create sample blogs
    const sampleBlogs = [
      {
        id: "blog-1",
        title: "Understanding Anxiety: Signs and Coping Strategies",
        excerpt: "Anxiety affects millions of people worldwide. Learn to recognize the signs and discover effective coping mechanisms that can help you regain control.",
        content: "Anxiety is more than just feeling worried. It's a complex mental health condition that can manifest in various ways...",
        author: "Dr. Sarah Johnson",
        role: "Psychologist",
        cover: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: "blog-2",
        title: "The Science Behind Depression and Treatment Options",
        excerpt: "Depression is a serious medical condition that affects how you feel, think, and behave. Understanding the science can help in finding the right treatment.",
        content: "Depression involves changes in brain chemistry and function. Modern treatments combine medication and therapy...",
        author: "Dr. Michael Chen", 
        role: "Psychiatrist",
        cover: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?q=80&w=1200&auto=format&fit=crop",
      },
      {
        id: "blog-3",
        title: "Building Resilience: Mental Strength in Challenging Times",
        excerpt: "Resilience is the ability to bounce back from adversity. Discover practical techniques to build mental strength and emotional stability.",
        content: "Resilience isn't about avoiding stress, but about learning to adapt and recover from difficult situations...",
        author: "Dr. Priya Sharma",
        role: "Psychologist", 
        cover: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      }
    ];

    // Insert sample data
    await prisma.doctor.createMany({
      data: sampleDoctors,
      skipDuplicates: true,
    });

    await prisma.blog.createMany({
      data: sampleBlogs,
      skipDuplicates: true,
    });

    console.log('Sample data created successfully');

    res.json({
      success: true,
      message: "Sample data created successfully",
      created: {
        doctors: sampleDoctors.length,
        blogs: sampleBlogs.length,
      }
    });
    
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: String(error)
    });
  }
}
