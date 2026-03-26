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
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, name: true, email: true, role: true, city: true, phone: true },
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Auth me error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, city, phone } = req.body as { name?: string; city?: string; phone?: string };

      if (!name && city === undefined && phone === undefined) {
        return res.status(400).json({ error: "Nothing to update" });
      }

      if (typeof name === "string" && name.trim().length === 0) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }

      const updated = await prisma.user.update({
        where: { id: auth.userId },
        data: {
          ...(typeof name === "string" ? { name: name.trim() } : {}),
          ...(city !== undefined ? { city } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
        select: { id: true, name: true, email: true, role: true, city: true, phone: true },
      });

      res.json({ user: updated });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
