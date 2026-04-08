import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const scans = await prisma.mealScan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json({ scans });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { description, photoUrl, calories, protein, carbs, fat, healthScore } = await req.json().catch(() => ({}));
  if (!description) return Response.json({ error: "description required" }, { status: 400 });
  const scan = await prisma.mealScan.create({
    data: {
      id: createId(),
      userId,
      description,
      photoUrl: photoUrl ?? null,
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      healthScore: healthScore ?? null,
    },
  });
  return Response.json({ scan });
}
