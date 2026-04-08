import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { borderId } = await req.json().catch(() => ({}));
  if (borderId) {
    const owned = await prisma.userBorder.findUnique({
      where: { userId_borderId: { userId, borderId } },
    });
    if (!owned) return Response.json({ error: "Border not owned" }, { status: 403 });
  }
  const profile = await prisma.profile.update({
    where: { userId },
    data: { activeBorderId: borderId ?? null },
  });
  return Response.json({ profile });
}
