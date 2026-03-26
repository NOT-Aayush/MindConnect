import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    const doctorCount = await prisma.doctor.count();
    const doctors = await prisma.doctor.findMany({
      take: 5,
      include: { freeSlots: true }
    });
    
    console.log(`Found ${doctorCount} doctors`);
    res.json({ doctors: doctors });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: "Database connection failed", 
      details: String(error),
      env: {
        databaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
