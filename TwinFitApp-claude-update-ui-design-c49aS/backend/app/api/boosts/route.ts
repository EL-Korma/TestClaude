import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const boosts = await prisma.xpBoost.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "asc" },
  });
  return Response.json({ boosts });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { multiplier, durationHours, cost } = await req.json().catch(() => ({}));
  if (!multiplier || !durationHours || cost == null) {
    return Response.json({ error: "multiplier, durationHours and cost required" }, { status: 400 });
  }
  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < cost) return Response.json({ error: "Insufficient balance" }, { status: 400 });

  const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);
  const [updatedWallet, boost] = await prisma.$transaction([
    prisma.dumbbellWallet.update({
      where: { userId },
      data: { balance: { decrement: cost } },
    }),
    prisma.xpBoost.create({
      data: { id: createId(), userId, multiplier, expiresAt },
    }),
    prisma.dumbbellTransaction.create({
      data: {
        id:           createId(),
        userId,
        amount:       -cost,
        reason:       `boost:${multiplier}x`,
        balanceAfter: wallet.balance - cost,
      },
    }),
  ]);

  return Response.json({ boost, wallet: updatedWallet });
}
