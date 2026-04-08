import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  return Response.json({ user });
}
