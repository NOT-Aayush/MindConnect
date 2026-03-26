import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export async function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes (mounted under /api by Vite plugin)
  app.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/demo", handleDemo);

  // Auth routes
  try {
    const { register, login, me } = await import("./routes/auth");
    app.post("/auth/register", register);
    app.post("/auth/login", login);
    app.get("/auth/me", me);
    // Allow users to update their profile (name/city/phone)
    const { updateMe } = await import("./routes/auth");
    app.put("/auth/me", updateMe);
  } catch (err) {
    console.error('Failed to load auth routes:', err);
    app.post('/auth/register', (_req, res) => res.status(500).json({ error: 'Auth not available' }));
    app.post('/auth/login', (_req, res) => res.status(500).json({ error: 'Auth not available' }));
    app.get('/auth/me', (_req, res) => res.status(500).json({ error: 'Auth not available' }));
  }

  // API routes
  try {
    const apiRoutes = await import("./routes/api");
    // `server/routes/api.ts` exports a default router already typed as a RequestHandler.
    app.use("/", apiRoutes.default as any);
  } catch (err) {
    console.error('Failed to load API routes, registering fallback routes:', err);
    // Fallback sample data
    const sample = [
      { id: 'doc-fallback-1', name: 'Dr. Fallback', city: 'Delhi', specialty: 'Psychologist', experienceYears: 5, background: 'Sample doctor', feesINR: 1000, languages: ['English'], rating: 4.5, freeSlots: [] },
    ];
    app.get('/doctors', (_req, res) => res.json({ doctors: sample }));
    app.get('/doctors/:id', (req, res) => {
      const d = sample.find(s => s.id === req.params.id);
      if (!d) return res.status(404).json({ error: 'Not found' });
      res.json({ doctor: d });
    });
    app.get('/blogs', (_req, res) => res.json({ blogs: [] }));
  }

  return app;
}
