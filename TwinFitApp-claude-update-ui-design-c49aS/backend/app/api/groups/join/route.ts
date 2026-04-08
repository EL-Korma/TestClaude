import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { inviteCode } = await req.json().catch(() => ({}));
  if (!inviteCode) return Response.json({ error: "inviteCode required" }, { status: 400 });
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) return Response.json({ error: "Invalid invite code" }, { status: 404 });

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
  });
  if (existing && existing.status === "ACTIVE") {
    return Response.json({ error: "Already a member" }, { status: 409 });
  }
  if (existing) {
    await prisma.groupMember.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
  } else {
    await prisma.groupMember.create({
      data: { id: createId(), groupId: group.id, userId, status: "ACTIVE", joinedAt: new Date() },
    });
  }
  const fullGroup = await prisma.group.findUnique({
    where: { id: group.id },
    include: { members: { include: { user: { include: { profile: true } } } } },
  });
  return Response.json({ group: fullGroup });
}
