import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

const ALLOWED = ["avatarUrl", "avatarEmoji", "avatarType", "bio", "heightCm", "weightKg", "gymFrequency", "objective", "dietType"];

export async function PATCH(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const profile = await prisma.profile.update({ where: { userId }, data });
  return Response.json({ profile });
}
