import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const memberships = await prisma.groupMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      group: {
        include: {
          members: {
            where: { status: { not: "LEFT" } },
            include: { user: { include: { profile: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
  const groups = memberships.map((m: any) => m.group);
  return Response.json({ groups });
}
