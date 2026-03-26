import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";

async function authMiddleware(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace(/Bearer\s?/i, "");
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

async function requireAdmin(req, res) {
  const auth = await authMiddleware(req);
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true },
  });
  
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      console.log('Fetching doctors for city:', req.query.city);
      
      const city = String(req.query.city || "");
      const where = city ? { where: { city } } : {};
      const docs = await prisma.doctor.findMany({
        ...(where as any),
        include: { freeSlots: true },
        orderBy: { rating: "desc" },
      });
      
      console.log(`Found ${docs.length} doctors`);
      res.json({ doctors: docs });
    } catch (error) {
      console.error('Doctors fetch error:', error);
      console.error('Database URL length:', process.env.DATABASE_URL?.length || 0);
      res.status(500).json({ error: "Internal server error", details: String(error) });
    }
  } else if (req.method === 'POST') {
    if (!(await requireAdmin(req, res))) return;

    try {
      const { name, city, specialty, experienceYears, background, feesINR, languages, avatarUrl } = req.body;
      
      const doc = await prisma.doctor.create({ 
        data: { 
          name, 
          city, 
          specialty, 
          experienceYears: Number(experienceYears || 0), 
          background, 
          feesINR: Number(feesINR || 0), 
          languages: languages || "English", 
          avatarUrl 
        } 
      });
      
      res.json({ doctor: doc });
    } catch (error) {
      console.error('Doctor creation error:', error);
      res.status(500).json({ error: "Internal server error", details: String(error) });
    }
  } else if (req.method === 'DELETE') {
    if (!(await requireAdmin(req, res))) return;

    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Doctor ID required" });
      }

      // Check if doctor has any bookings
      const bookingsCount = await prisma.booking.count({
        where: { doctorId: id }
      });

      if (bookingsCount > 0) {
        return res.status(400).json({ 
          error: "Cannot delete doctor with existing bookings",
          bookingsCount 
        });
      }

      await prisma.doctor.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Doctor deletion error:', error);
      res.status(500).json({ error: "Internal server error", details: String(error) });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
