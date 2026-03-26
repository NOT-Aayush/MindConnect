import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('=== CREATE ADMIN USER ===');
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      await prisma.$connect();
      console.log('✅ Database connected');
      
      const { name, email, password } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing fields" });
      }

      // Check if admin already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Create admin user with hardcoded role to avoid enum issues
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { 
          name, 
          email, 
          password: hashed, 
          role: 'ADMIN' as any // Type cast to bypass enum check
        },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        message: "Admin user created successfully"
      });
      
    } catch (error) {
      console.error('Admin creation error:', error);
      res.status(500).json({ 
        error: "Failed to create admin user", 
        details: String(error)
      });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
