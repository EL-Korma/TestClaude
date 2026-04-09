import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      username: true,
      name: true,
      surname: true,
      age: true,
      gender: true,
      createdAt: true,
      profile: true,
    },
  });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user });
}
