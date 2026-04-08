import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return Response.json({ ok: true, updated: result.count });
}
