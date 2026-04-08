import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";
import { getPeriodKey } from "@/lib/helpers";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const quests = await prisma.quest.findMany({ orderBy: { frequency: "asc" } });
  const periodKeys = [...new Set(quests.map((q: any) => getPeriodKey(q.frequency)))];

  const progress = await prisma.userQuestProgress.findMany({
    where: {
      userId,
      questId: { in: quests.map((q: any) => q.id) },
      periodKey: { in: periodKeys as string[] },
    },
  });

  const result = quests.map((q: any) => ({
    ...q,
    userProgress: progress.find((p: any) => p.questId === q.id && p.periodKey === getPeriodKey(q.frequency)) ?? null,
  }));
  return Response.json({ quests: result });
}
