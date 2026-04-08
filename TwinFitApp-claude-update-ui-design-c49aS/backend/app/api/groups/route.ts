import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { name, mode } = await req.json().catch(() => ({}));
  if (!name || !mode) return Response.json({ error: "name and mode required" }, { status: 400 });
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const group = await prisma.group.create({
    data: { id: createId(), name, mode, inviteCode },
  });
  await prisma.groupMember.create({
    data: { id: createId(), groupId: group.id, userId, status: "ACTIVE", joinedAt: new Date() },
  });
  const fullGroup = await prisma.group.findUnique({
    where: { id: group.id },
    include: { members: { include: { user: { include: { profile: true } } } } },
  });
  return Response.json({ group: fullGroup });
}
