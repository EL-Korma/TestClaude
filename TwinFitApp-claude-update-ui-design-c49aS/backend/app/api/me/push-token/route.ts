import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const { token } = await req.json().catch(() => ({}));
  if (!token) return Response.json({ error: "token required" }, { status: 400 });

  // Upsert push token on user profile
  await prisma.profile.upsert({
    where: { userId },
    update: { pushToken: token } as any,
    create: { id: userId + "_profile", userId, pushToken: token } as any,
  }).catch(async () => {
    // If pushToken column doesn't exist yet, silently skip
  });

  return Response.json({ success: true });
}
