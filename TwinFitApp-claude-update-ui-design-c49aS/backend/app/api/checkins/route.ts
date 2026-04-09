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
  const { start, end } = getTodayRange();

  // Prevent double check-in same day
  const alreadyToday = await prisma.checkIn.findFirst({
    where: { userId, capturedAt: { gte: start, lte: end } },
  });
  if (alreadyToday) {
    return Response.json({ error: "Already checked in today" }, { status: 409 });
  }

  const checkIn = await prisma.checkIn.create({
    data: { id: createId(), userId, groupId: groupId || null, photoUrl, capturedAt: timestamp, status: "VALIDATED" },
  });

  // Update user streak — only increment if no log yesterday or continuing streak
  const currentStreak = await prisma.streak.findFirst({ where: { userId } });
  let userStreak;
  if (currentStreak) {
    const lastLog = currentStreak.lastLogDate ? new Date(currentStreak.lastLogDate) : null;
    const yesterday = new Date(start);
    yesterday.setDate(yesterday.getDate() - 1);
    const loggedYesterday = lastLog && lastLog >= yesterday && lastLog < start;
    const newCurrent = loggedYesterday ? (currentStreak.current || 0) + 1 : 1;
    const newLongest = Math.max(currentStreak.longest || 0, newCurrent);
    userStreak = await prisma.streak.update({
      where: { id: currentStreak.id },
      data: {
        current: newCurrent,
        longest: newLongest,
        weeklyCount: { increment: 1 },
        level: resolveStreakLevel(newCurrent),
        lastLogDate: new Date(),
      },
    });
  } else {
    userStreak = await prisma.streak.create({
      data: { id: createId(), userId, current: 1, longest: 1, weeklyCount: 1, level: 1, lastLogDate: new Date() },
    });
  }

  // Update group streak if all active members checked in today
  let groupStreak = null;
  const activeGroupId = groupId || null;
  if (activeGroupId) {
    const members = await prisma.groupMember.findMany({ where: { groupId: activeGroupId, status: "ACTIVE" } });
    const memberIds = members.map((m: any) => m.userId);
    const todayCheckIns = await prisma.checkIn.findMany({
      where: { groupId: activeGroupId, userId: { in: memberIds }, status: "VALIDATED", capturedAt: { gte: start, lte: end } },
    });
    const allDone = memberIds.length >= 2 && memberIds.every((id: string) => todayCheckIns.some((c: any) => c.userId === id));
    if (allDone) {
      const current = await prisma.streak.findFirst({ where: { groupId: activeGroupId } });
      if (current) {
        const lastLog = current.lastLogDate ? new Date(current.lastLogDate) : null;
        const yesterday = new Date(start);
        yesterday.setDate(yesterday.getDate() - 1);
        const loggedYesterday = lastLog && lastLog >= yesterday && lastLog < start;
        const newCurrent = loggedYesterday ? (current.current || 0) + 1 : 1;
        const newLongest = Math.max(current.longest || 0, newCurrent);
        groupStreak = await prisma.streak.update({
          where: { id: current.id },
          data: {
            current: newCurrent,
            longest: newLongest,
            weeklyCount: { increment: 1 },
            level: resolveStreakLevel(newCurrent),
            lastLogDate: new Date(),
          },
        });
      } else {
        groupStreak = await prisma.streak.create({
          data: { id: createId(), groupId: activeGroupId, current: 1, longest: 1, weeklyCount: 1, level: 1, lastLogDate: new Date() },
        });
      }

      // Notify partner that both logged today
      const partnerIds = memberIds.filter((id: string) => id !== userId);
      for (const partnerId of partnerIds) {
        await prisma.notification.create({
          data: {
            id: createId(),
            userId: partnerId,
            type: "STREAK",
            title: "🔥 Duo Streak Extended!",
            body: "Both partners checked in today. Streak continues!",
          },
        }).catch(() => {});
      }
    } else {
      // Notify partner that you checked in (they haven't yet)
      const partnerIds = memberIds.filter((id: string) => id !== userId);
      for (const partnerId of partnerIds) {
        const partnerCheckedIn = todayCheckIns.some((c: any) => c.userId === partnerId);
        if (!partnerCheckedIn) {
          const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
          await prisma.notification.create({
            data: {
              id: createId(),
              userId: partnerId,
              type: "CHECKIN",
              title: "📸 Partner checked in!",
              body: `${me?.name ?? "Your partner"} already logged today. Don't break the streak!`,
            },
          }).catch(() => {});
        }
      }
    }
  }

  return Response.json({ checkIn, userStreak, groupStreak });
}
