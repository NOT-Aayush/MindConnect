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

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.query.id as string } });
    if (!booking) {
      return res.status(404).json({ error: "Not found" });
    }
    if (booking.userId !== auth.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await prisma.booking.delete({ where: { id: req.query.id as string } });
    res.json({ ok: true });
  } catch (error) {
    console.error('Booking deletion error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
