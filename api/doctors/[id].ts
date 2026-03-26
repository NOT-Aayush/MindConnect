import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
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
    const doc = await prisma.doctor.findUnique({ 
      where: { id: req.query.id as string }, 
      include: { freeSlots: true } 
    });
    if (!doc) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ doctor: doc });
  } catch (error) {
    console.error('Doctor fetch error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
