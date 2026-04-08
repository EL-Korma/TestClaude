import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const transactions = await prisma.dumbbellTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json({ transactions });
}
