import { RequestHandler } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";

export const register: RequestHandler = async (req, res) => {
  const { name, email, password, phone, city, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone, city, role: role ?? "PATIENT" },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city } });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city } });
};

export const me: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization" });
  const token = auth.replace(/Bearer\s?/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, city: true, phone: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const updateMe: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization" });
  const token = auth.replace(/Bearer\s?/i, "");

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { name, city, phone } = req.body as { name?: string; city?: string; phone?: string };

    if (!name && city === undefined && phone === undefined) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    if (typeof name === "string" && name.trim().length === 0) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(typeof name === "string" ? { name: name.trim() } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      select: { id: true, name: true, email: true, role: true, city: true, phone: true },
    });

    res.json({ user: updated });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
