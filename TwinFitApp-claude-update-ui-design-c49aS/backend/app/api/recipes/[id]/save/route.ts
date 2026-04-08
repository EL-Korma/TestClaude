import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!recipe) return Response.json({ error: "Recipe not found" }, { status: 404 });
  const updated = await prisma.recipe.update({ where: { id: recipe.id }, data: { saved: !recipe.saved } });
  return Response.json({ recipe: updated });
}
