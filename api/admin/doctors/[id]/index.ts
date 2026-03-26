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

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireAdmin(req, res))) return;

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: id as string }
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Check if doctor has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { doctorId: id as string }
    });

    if (bookingsCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete doctor with existing bookings",
        bookingsCount 
      });
    }

    // Delete the doctor
    await prisma.doctor.delete({
      where: { id: id as string }
    });

    console.log(`Doctor ${id} deleted successfully by admin`);
    res.json({ 
      success: true, 
      message: "Doctor deleted successfully" 
    });

  } catch (error) {
    console.error('Doctor deletion error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: String(error) 
    });
  }
}
