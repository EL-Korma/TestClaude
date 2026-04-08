import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";
import { tryParseJson } from "@/lib/helpers";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const savedOnly = req.nextUrl.searchParams.get("savedOnly");
  const rows = await prisma.recipe.findMany({
    where: { userId, ...(savedOnly === "true" ? { saved: true } : {}) },
    orderBy: { createdAt: "desc" },
  });
  const recipes = rows.map((r: any) => ({
    ...r,
    ingredients: tryParseJson(r.ingredients, []),
    steps: tryParseJson(r.steps, []),
  }));
  return Response.json({ recipes });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { name, steps, ingredients, calories, protein, carbs, fat, goal } = await req.json().catch(() => ({}));
  if (!name || !steps || !ingredients) {
    return Response.json({ error: "name, steps and ingredients required" }, { status: 400 });
  }
  const recipe = await prisma.recipe.create({
    data: {
      id: createId(),
      userId,
      name,
      steps: JSON.stringify(Array.isArray(steps) ? steps : [steps]),
      ingredients: JSON.stringify(Array.isArray(ingredients) ? ingredients : [ingredients]),
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      goal: goal ?? null,
    },
  });
  return Response.json({
    recipe: { ...recipe, ingredients: tryParseJson(recipe.ingredients, []), steps: tryParseJson(recipe.steps, []) },
  });
}
