import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('Database URL length:', process.env.DATABASE_URL?.length || 0);
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Count records
    const doctorCount = await prisma.doctor.count();
    const blogCount = await prisma.blog.count();
    const userCount = await prisma.user.count();
    
    console.log(`Counts: Doctors=${doctorCount}, Blogs=${blogCount}, Users=${userCount}`);
    
    // Get sample data
    const sampleDoctors = await prisma.doctor.findMany({ take: 3 });
    const sampleBlogs = await prisma.blog.findMany({ take: 3 });
    
    console.log('Sample doctors:', sampleDoctors);
    console.log('Sample blogs:', sampleBlogs);
    
    res.json({
      status: "success",
      database: {
        connected: true,
        url: process.env.DATABASE_URL ? `***${process.env.DATABASE_URL.slice(-10)}` : "missing"
      },
      counts: {
        doctors: doctorCount,
        blogs: blogCount,
        users: userCount
      },
      sampleData: {
        doctors: sampleDoctors,
        blogs: sampleBlogs
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: String(error),
      database: {
        connected: false,
        url: process.env.DATABASE_URL ? `***${process.env.DATABASE_URL.slice(-10)}` : "missing"
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
