import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { code } = await params;
  const border = await prisma.border.findUnique({ where: { code } });
  if (!border) return Response.json({ error: "Border not found" }, { status: 404 });

  const alreadyOwned = await prisma.userBorder.findUnique({
    where: { userId_borderId: { userId, borderId: border.id } },
  });
  if (alreadyOwned) return Response.json({ error: "Already owned" }, { status: 409 });

  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < border.cost) {
    return Response.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const [updatedWallet] = await prisma.$transaction([
    prisma.dumbbellWallet.update({
      where: { userId },
      data: { balance: { decrement: border.cost } },
    }),
    prisma.dumbbellTransaction.create({
      data: {
        id:           createId(),
        userId,
        amount:       -border.cost,
        reason:       `border:${border.code}`,
        balanceAfter: wallet.balance - border.cost,
      },
    }),
    prisma.userBorder.create({
      data: { id: createId(), userId, borderId: border.id },
    }),
  ]);

  return Response.json({ wallet: updatedWallet, border });
}
