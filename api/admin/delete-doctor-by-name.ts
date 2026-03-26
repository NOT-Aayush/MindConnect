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

  if (req.method === 'DELETE') {
    if (!(await requireAdmin(req, res))) return;

    try {
      const { name, city } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Doctor name required" });
      }

      // Find doctors by name and city
      const doctorsToDelete = await prisma.doctor.findMany({
        where: {
          name: name,
          ...(city && { city })
        }
      });

      if (doctorsToDelete.length === 0) {
        return res.status(404).json({ error: "No doctors found with given name and city" });
      }

      // Check if any have bookings
      const doctorIds = doctorsToDelete.map(d => d.id);
      const bookingsCount = await prisma.booking.count({
        where: { doctorId: { in: doctorIds } }
      });

      if (bookingsCount > 0) {
        return res.status(400).json({ 
          error: "Cannot delete doctors with existing bookings",
          bookingsCount 
        });
      }

      // Delete all matching doctors
      await prisma.doctor.deleteMany({
        where: {
          name: name,
          ...(city && { city })
        }
      });

      res.json({ 
        success: true, 
        deletedCount: doctorsToDelete.length,
        deletedDoctors: doctorsToDelete.map(d => ({ id: d.id, name: d.name, city: d.city }))
      });
    } catch (error) {
      console.error('Doctor deletion error:', error);
      res.status(500).json({ error: "Internal server error", details: String(error) });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
