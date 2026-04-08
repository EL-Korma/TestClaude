import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const [borders, owned] = await Promise.all([
    prisma.border.findMany({ orderBy: { cost: "asc" } }),
    prisma.userBorder.findMany({ where: { userId }, select: { borderId: true } }),
  ]);
  const ownedIds = new Set(owned.map((o: any) => o.borderId));
  return Response.json({ borders: borders.map((b: any) => ({ ...b, owned: ownedIds.has(b.id) })) });
}
