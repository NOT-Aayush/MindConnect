import { PrismaClient } from "@prisma/client";
import { doctors as staticDoctors, generateSlots } from "../client/data/doctors";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  // Clean
  await prisma.booking.deleteMany();
  await prisma.freeSlot.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  // Create admin
  const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@mindconnect.test", password: "adminpass", role: "ADMIN" } });

  // Users
  await prisma.user.createMany({ data: [
    { name: "Ashish Rawat", email: "ashish@example.com", password: "password", role: "PATIENT", city: "Delhi" },
    { name: "Priya Sharma", email: "priya@example.com", password: "password", role: "DOCTOR", city: "Delhi" },
  ]});

  // Doctors
  // Seed doctors for every city in the demo list so booking works for non-Delhi flows too.
  // Prisma generates its own `Doctor.id` values (cuid), so the UI booking flow resolves by name/specialty/city.
  for (const sd of staticDoctors) {
    const doc = await prisma.doctor.create({
      data: {
        name: sd.name,
        city: sd.city,
        specialty: sd.specialty,
        experienceYears: sd.experienceYears,
        background: sd.background,
        feesINR: sd.feesINR,
        languages: Array.isArray(sd.languages) ? sd.languages.join(",") : String(sd.languages),
        rating: sd.rating,
        avatarUrl: sd.avatarUrl ?? null,
      },
    });

    const slots = generateSlots();
    await prisma.freeSlot.createMany({
      data: slots.map((s) => ({
        doctorId: doc.id,
        start: new Date(s.start),
        end: new Date(s.end),
      })),
    });
  }

  // Blogs
  await prisma.blog.createMany({ data: [
    { title: "Understanding Burnout", excerpt: "Burnout can look like laziness...", content: "Full content...", author: "Rahul Verma", role: "Psychologist" },
    { title: "My Journey with Therapy", excerpt: "Therapy helped me...", content: "Full content...", author: "A Patient", role: "Patient" },
  ]});

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
