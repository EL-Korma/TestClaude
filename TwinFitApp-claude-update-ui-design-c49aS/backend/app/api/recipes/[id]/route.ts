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
  await prisma.recipe.deleteMany({ where: { id, userId } });
  return Response.json({ ok: true });
}
