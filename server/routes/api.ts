import { RequestHandler, Router } from "express";
import { prisma } from "../prisma";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";

function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization" });
  const token = auth.replace(/Bearer\s?/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

async function requireAdmin(req: any, res: any) {
  const me = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, role: true },
  });
  if (!me || me.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

// List doctors (public)
router.get("/doctors", async (req, res) => {
  const city = String(req.query.city || "");
  const where = city ? { where: { city } } : {};
  const docs = await prisma.doctor.findMany({
    ...(where as any),
    include: { freeSlots: true },
    orderBy: { rating: "desc" },
  });
  res.json({ doctors: docs });
});

// Get single doctor
router.get("/doctors/:id", async (req, res) => {
  const doc = await prisma.doctor.findUnique({ where: { id: req.params.id }, include: { freeSlots: true } });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json({ doctor: doc });
});

// Admin: create doctor (simple)
router.post("/doctors", authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { name, city, specialty, experienceYears, background, feesINR, languages, avatarUrl } = req.body;
  const doc = await prisma.doctor.create({ data: { name, city, specialty, experienceYears: Number(experienceYears || 0), background, feesINR: Number(feesINR || 0), languages: languages || "English", avatarUrl } });
  res.json({ doctor: doc });
});

// Bookings endpoints (auth required)
router.get("/bookings", authMiddleware, async (req: any, res) => {
  const userId = req.userId;
  const bookings = await prisma.booking.findMany({ where: { userId }, include: { doctor: true } });
  res.json({ bookings });
});

router.post("/bookings", authMiddleware, async (req: any, res) => {
  const userId = req.userId;
  const { doctorId, slotStart, slotEnd } = req.body;

  if (!doctorId || !slotStart || !slotEnd) {
    return res.status(400).json({ error: "Missing doctorId/slotStart/slotEnd" });
  }

  const parsedSlotStart = new Date(slotStart);
  const parsedSlotEnd = new Date(slotEnd);
  if (Number.isNaN(parsedSlotStart.getTime()) || Number.isNaN(parsedSlotEnd.getTime())) {
    return res.status(400).json({ error: "Invalid slotStart/slotEnd date" });
  }

  // Avoid FK constraint violations by ensuring referenced rows exist.
  const [user, doctor] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true } }),
  ]);

  if (!user) return res.status(401).json({ error: "User not found for this token" });
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  // Basic conflict check
  const conflict = await prisma.booking.findFirst({ where: { doctorId, slotStart: parsedSlotStart } });
  if (conflict) return res.status(409).json({ error: "Slot already booked" });
  const b = await prisma.booking.create({
    data: { userId, doctorId, slotStart: parsedSlotStart, slotEnd: parsedSlotEnd },
  });
  res.json({ booking: b });
});

router.delete("/bookings/:id", authMiddleware, async (req: any, res) => {
  const userId = req.userId;
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Not found" });
  if (booking.userId !== userId) return res.status(403).json({ error: "Forbidden" });
  await prisma.booking.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Admin endpoints
router.get("/admin/stats", authMiddleware, async (req: any, res) => {
  if (!(await requireAdmin(req, res))) return;
  const [users, doctors, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.booking.count(),
  ]);
  res.json({ stats: { users, doctors, bookings } });
});

router.get("/admin/users", authMiddleware, async (req: any, res) => {
  if (!(await requireAdmin(req, res))) return;
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, city: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

router.get("/admin/bookings", authMiddleware, async (req: any, res) => {
  if (!(await requireAdmin(req, res))) return;
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      doctor: { select: { id: true, name: true, city: true, specialty: true, feesINR: true } },
      user: { select: { id: true, name: true, email: true, city: true } },
    },
  });
  res.json({ bookings });
});

// Blogs
router.get("/blogs", async (req, res) => {
  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ blogs });
});

export default router as unknown as RequestHandler;
