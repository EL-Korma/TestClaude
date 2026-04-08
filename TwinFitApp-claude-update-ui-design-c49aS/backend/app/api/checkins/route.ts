import { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { getUserId, unauthorized } from "@/lib/auth";
import { getTodayRange, resolveStreakLevel } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { groupId, photoUrl, capturedAt } = await req.json().catch(() => ({}));
  if (!photoUrl) return Response.json({ error: "photoUrl required" }, { status: 400 });
  const timestamp = capturedAt ? new Date(capturedAt) : new Date();

  const checkIn = await prisma.checkIn.create({
    data: { id: createId(), userId, groupId, photoUrl, capturedAt: timestamp, status: "VALIDATED" },
  });

  // Update user streak
  const currentStreak = await prisma.streak.findFirst({ where: { userId } });
  let userStreak;
  if (currentStreak) {
    userStreak = await prisma.streak.update({
      where: { id: currentStreak.id },
      data: {
        current: { increment: 1 },
        weeklyCount: { increment: 1 },
        level: resolveStreakLevel((currentStreak.current || 0) + 1),
        lastLogDate: new Date(),
      },
    });
  } else {
    userStreak = await prisma.streak.create({
      data: { id: createId(), userId, current: 1, weeklyCount: 1, level: 1, lastLogDate: new Date() },
    });
  }

  // Update group streak if all members checked in today
  let groupStreak = null;
  if (groupId) {
    const { start, end } = getTodayRange();
    const members = await prisma.groupMember.findMany({ where: { groupId, status: "ACTIVE" } });
    const memberIds = members.map((m: any) => m.userId);
    const todayCheckIns = await prisma.checkIn.findMany({
      where: { groupId, userId: { in: memberIds }, status: "VALIDATED", capturedAt: { gte: start, lte: end } },
    });
    const allDone = memberIds.length > 0 && memberIds.every((id: string) => todayCheckIns.some((c: any) => c.userId === id));
    if (allDone) {
      const current = await prisma.streak.findFirst({ where: { groupId } });
      if (current) {
        groupStreak = await prisma.streak.update({
          where: { id: current.id },
          data: {
            current: { increment: 1 },
            weeklyCount: { increment: 1 },
            level: resolveStreakLevel((current.current || 0) + 1),
            lastLogDate: new Date(),
          },
        });
      } else {
        groupStreak = await prisma.streak.create({
          data: { id: createId(), groupId, current: 1, weeklyCount: 1, level: 1, lastLogDate: new Date() },
        });
      }
    }
  }

  return Response.json({ checkIn, userStreak, groupStreak });
}
