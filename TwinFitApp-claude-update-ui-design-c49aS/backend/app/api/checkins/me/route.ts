import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const checkins = await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { capturedAt: "desc" },
    take: 50,
  });
  return Response.json({ checkins });
}
