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
    console.log('=== USERS DEBUG ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test basic query
    const userCount = await prisma.user.count();
    const doctorCount = await prisma.doctor.count();
    const bookingCount = await prisma.booking.count();
    
    console.log(`Users: ${userCount}, Doctors: ${doctorCount}, Bookings: ${bookingCount}`);
    
    // Get all users
    const users = await prisma.user.findMany({
      take: 5,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        city: true, 
        createdAt: true 
      }
    });
    
    // Get admin users specifically
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.json({
      status: 'success',
      counts: {
        userCount,
        doctorCount,
        bookingCount,
        adminCount: adminUsers.length
      },
      users: users,
      adminUsers: adminUsers,
      env: {
        databaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Users debug error:', error);
    res.status(500).json({ 
      error: "Database query failed", 
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
