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
    console.log('Fetching blogs from database...');
    
    const blogs = await prisma.blog.findMany({ 
      orderBy: { createdAt: "desc" } 
    });
    
    console.log(`Found ${blogs.length} blogs`);
    console.log('Blog sample:', blogs.slice(0, 2));
    
    res.json({ blogs });
  } catch (error) {
    console.error('Blogs fetch error:', error);
    console.error('Database URL length:', process.env.DATABASE_URL?.length || 0);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
}
