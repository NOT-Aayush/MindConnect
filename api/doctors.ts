import { prisma } from "../server/prisma";

export default async function handler(req, res) {
  const { city } = req.query;

  const doctors = await prisma.doctor.findMany({
    where: city ? { city } : {},
    include: { freeSlots: true },
    orderBy: { rating: "desc" },
  });

  res.status(200).json({ doctors });
}