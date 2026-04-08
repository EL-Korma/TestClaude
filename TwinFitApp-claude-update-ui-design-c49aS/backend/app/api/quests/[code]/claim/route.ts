import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";
import { getPeriodKey } from "@/lib/helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { code } = await params;
  const quest = await prisma.quest.findUnique({ where: { code } });
  if (!quest) return Response.json({ error: "Quest not found" }, { status: 404 });

  const periodKey = getPeriodKey(quest.frequency);
  const progressRecord = await prisma.userQuestProgress.findUnique({
    where: { userId_questId_periodKey: { userId, questId: quest.id, periodKey } },
  });
  if (!progressRecord?.completed) return Response.json({ error: "Quest not completed" }, { status: 400 });
  if (progressRecord.claimedAt)   return Response.json({ error: "Already claimed" }, { status: 400 });

  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId } });
  if (!wallet) return Response.json({ error: "Wallet not found" }, { status: 404 });

  const [updatedWallet] = await prisma.$transaction([
    prisma.dumbbellWallet.update({
      where: { userId },
      data: {
        balance:     { increment: quest.reward },
        totalEarned: { increment: quest.reward },
        xp:          { increment: quest.xpReward },
      },
    }),
    prisma.dumbbellTransaction.create({
      data: {
        id:           createId(),
        userId,
        amount:       quest.reward,
        reason:       `quest:${quest.code}`,
        balanceAfter: wallet.balance + quest.reward,
      },
    }),
    prisma.userQuestProgress.update({
      where: { id: progressRecord.id },
      data: { claimedAt: new Date() },
    }),
  ]);

  return Response.json({ wallet: updatedWallet });
}
