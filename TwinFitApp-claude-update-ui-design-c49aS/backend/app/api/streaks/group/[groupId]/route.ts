import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { groupId } = await params;
  const streak = await prisma.streak.findFirst({ where: { groupId } });
  return Response.json({ streak });
}
