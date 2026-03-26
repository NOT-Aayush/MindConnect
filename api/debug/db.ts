import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('=== DATABASE DEBUG ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql://'));
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test basic query
    const userCount = await prisma.user.count();
    const doctorCount = await prisma.doctor.count();
    const bookingCount = await prisma.booking.count();
    
    console.log(`Users: ${userCount}, Doctors: ${doctorCount}, Bookings: ${bookingCount}`);
    
    // Get sample data
    const sampleDoctors = await prisma.doctor.findMany({
      take: 3,
      select: { id: true, name: true, city: true, specialty: true }
    });
    
    res.json({
      status: 'success',
      database: {
        connected: true,
        userCount,
        doctorCount,
        bookingCount,
        sampleDoctors
      },
      env: {
        databaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    res.status(500).json({
      status: 'error',
      error: String(error),
      env: {
        databaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
