import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        where: { status: { not: "LEFT" } },
        include: { user: { include: { profile: true } } },
      },
    },
  });
  if (!group) return Response.json({ error: "Group not found" }, { status: 404 });
  return Response.json({ group });
}
