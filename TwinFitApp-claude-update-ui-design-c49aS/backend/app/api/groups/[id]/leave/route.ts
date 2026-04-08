import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  await prisma.groupMember.updateMany({
    where: { groupId: id, userId },
    data: { status: "LEFT" },
  });
  return Response.json({ ok: true });
}
