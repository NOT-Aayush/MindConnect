import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";

async function authMiddleware(req: VercelRequest): Promise<{ userId: string } | null> {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace(/Bearer\s?/i, "");
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const auth = await authMiddleware(req);
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const bookings = await prisma.booking.findMany({ 
        where: { userId: auth.userId }, 
        include: { doctor: true } 
      });
      res.json({ bookings });
    } catch (error) {
      console.error('Bookings fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === 'POST') {
    try {
      const { doctorId, slotStart, slotEnd } = req.body;

      if (!doctorId || !slotStart || !slotEnd) {
        return res.status(400).json({ error: "Missing doctorId/slotStart/slotEnd" });
      }

      const parsedSlotStart = new Date(slotStart);
      const parsedSlotEnd = new Date(slotEnd);
      if (Number.isNaN(parsedSlotStart.getTime()) || Number.isNaN(parsedSlotEnd.getTime())) {
        return res.status(400).json({ error: "Invalid slotStart/slotEnd date" });
      }

      const [user, doctor] = await Promise.all([
        prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true } }),
        prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true } }),
      ]);

      if (!user) return res.status(401).json({ error: "User not found" });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const conflict = await prisma.booking.findFirst({ where: { doctorId, slotStart: parsedSlotStart } });
      if (conflict) return res.status(409).json({ error: "Slot already booked" });

      const booking = await prisma.booking.create({
        data: { userId: auth.userId, doctorId, slotStart: parsedSlotStart, slotEnd: parsedSlotEnd },
      });
      res.json({ booking });
    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
