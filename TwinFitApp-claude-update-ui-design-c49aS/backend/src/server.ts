import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const app = express();
const adapter = new PrismaLibSql({ url: "file:prisma/dev.db" });
const prisma = new PrismaClient({ adapter }) as any;

const jwtSecret = process.env.JWT_SECRET || "dev_secret";

app.use(cors());
app.use(express.json());

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthRequest = express.Request & { userId?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const tryParseJson = (val: any, fallback: any) => { try { return JSON.parse(val); } catch { return fallback; } };

const authMiddleware = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const getTodayRange = () => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
};

const resolveStreakLevel = (current: number) => {
  if (current >= 28) return 4;
  if (current >= 14) return 3;
  if (current >= 7)  return 2;
  return 1;
};

const getPeriodKey = (frequency: string): string => {
  const now = new Date();
  if (frequency === "DAILY") {
    return now.toISOString().slice(0, 10); // "2024-04-04"
  }
  if (frequency === "WEEKLY") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  // MONTHLY
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/auth/register", async (req, res) => {
  const { name, surname, username, email, phone, password } = req.body || {};
  if (!name || !surname || !username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { username },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = createId();
  const user = await prisma.user.create({
    data: { id: userId, name, surname, username, email: normalizedEmail, phone, passwordHash },
  });
  await Promise.all([
    prisma.profile.create({ data: { id: createId(), userId: user.id } }),
    prisma.dumbbellWallet.create({ data: { id: createId(), userId: user.id } }),
  ]);

  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
});

app.post("/auth/login", async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) return res.status(400).json({ error: "Missing credentials" });
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: normalizeEmail(identifier) }, { username: identifier }, { phone: identifier }] },
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

app.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { profile: true },
  });
  res.json({ user });
});

app.patch("/me/profile", authMiddleware, async (req: AuthRequest, res) => {
  const allowed = ["avatarUrl", "avatarEmoji", "avatarType", "bio", "heightCm", "weightKg", "gymFrequency", "objective", "dietType"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  const profile = await prisma.profile.update({ where: { userId: req.userId }, data });
  res.json({ profile });
});

// ─── Groups ───────────────────────────────────────────────────────────────────

app.get("/me/groups", authMiddleware, async (req: AuthRequest, res) => {
  const memberships = await prisma.groupMember.findMany({
    where: { userId: req.userId, status: "ACTIVE" },
    include: {
      group: {
        include: {
          members: {
            where: { status: { not: "LEFT" } },
            include: { user: { include: { profile: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
  const groups = memberships.map((m: any) => m.group);
  res.json({ groups });
});

app.post("/groups", authMiddleware, async (req: AuthRequest, res) => {
  const { name, mode } = req.body || {};
  if (!name || !mode) return res.status(400).json({ error: "name and mode required" });
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const group = await prisma.group.create({
    data: { id: createId(), name, mode, inviteCode },
  });
  await prisma.groupMember.create({
    data: { id: createId(), groupId: group.id, userId: req.userId as string, status: "ACTIVE", joinedAt: new Date() },
  });
  res.json({ group });
});

app.get("/groups/:id", authMiddleware, async (req: AuthRequest, res) => {
  const group = await prisma.group.findUnique({
    where: { id: req.params.id },
    include: {
      members: {
        where: { status: { not: "LEFT" } },
        include: { user: { include: { profile: true } } },
      },
    },
  });
  if (!group) return res.status(404).json({ error: "Group not found" });
  res.json({ group });
});

app.post("/groups/join", authMiddleware, async (req: AuthRequest, res) => {
  const { inviteCode } = req.body || {};
  if (!inviteCode) return res.status(400).json({ error: "inviteCode required" });
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) return res.status(404).json({ error: "Invalid invite code" });

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: req.userId as string } },
  });
  if (existing && existing.status === "ACTIVE") {
    return res.status(409).json({ error: "Already a member" });
  }
  if (existing) {
    await prisma.groupMember.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
  } else {
    await prisma.groupMember.create({
      data: { id: createId(), groupId: group.id, userId: req.userId as string, status: "ACTIVE", joinedAt: new Date() },
    });
  }
  res.json({ group });
});

app.delete("/groups/:id/leave", authMiddleware, async (req: AuthRequest, res) => {
  await prisma.groupMember.updateMany({
    where: { groupId: req.params.id, userId: req.userId },
    data: { status: "LEFT" },
  });
  res.json({ ok: true });
});

// ─── Check-ins ────────────────────────────────────────────────────────────────

app.post("/checkins", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId, photoUrl, capturedAt } = req.body || {};
  if (!photoUrl) return res.status(400).json({ error: "photoUrl required" });
  const timestamp = capturedAt ? new Date(capturedAt) : new Date();

  const checkIn = await prisma.checkIn.create({
    data: {
      id: createId(),
      userId: req.userId as string,
      groupId,
      photoUrl,
      capturedAt: timestamp,
      status: "VALIDATED",
    },
  });

  // Update user streak
  const currentStreak = await prisma.streak.findFirst({ where: { userId: req.userId } });
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
      data: { id: createId(), userId: req.userId as string, current: 1, weeklyCount: 1, level: 1, lastLogDate: new Date() },
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

  res.json({ checkIn, userStreak, groupStreak });
});

app.get("/checkins/me", authMiddleware, async (req: AuthRequest, res) => {
  const checkins = await prisma.checkIn.findMany({
    where: { userId: req.userId },
    orderBy: { capturedAt: "desc" },
    take: 50,
  });
  res.json({ checkins });
});

// ─── Streaks ──────────────────────────────────────────────────────────────────

app.get("/streaks/me", authMiddleware, async (req: AuthRequest, res) => {
  const streak = await prisma.streak.findFirst({ where: { userId: req.userId } });
  res.json({ streak });
});

app.get("/streaks/group/:groupId", authMiddleware, async (_req: AuthRequest, res) => {
  const streak = await prisma.streak.findFirst({ where: { groupId: _req.params.groupId } });
  res.json({ streak });
});

// ─── Notifications ────────────────────────────────────────────────────────────

app.get("/notifications", authMiddleware, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ notifications });
});

app.patch("/notifications/:id/read", authMiddleware, async (req: AuthRequest, res) => {
  const notification = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { readAt: new Date() },
  });
  res.json({ ok: true, updated: notification.count });
});

app.patch("/notifications/read-all", authMiddleware, async (req: AuthRequest, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.userId, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ ok: true, updated: result.count });
});

// ─── Meal Scans ───────────────────────────────────────────────────────────────

app.get("/meal-scans", authMiddleware, async (req: AuthRequest, res) => {
  const scans = await prisma.mealScan.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ scans });
});

app.post("/meal-scans", authMiddleware, async (req: AuthRequest, res) => {
  const { description, photoUrl, calories, protein, carbs, fat, healthScore } = req.body || {};
  if (!description) return res.status(400).json({ error: "description required" });
  const scan = await prisma.mealScan.create({
    data: {
      id: createId(),
      userId: req.userId as string,
      description,
      photoUrl: photoUrl ?? null,
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      healthScore: healthScore ?? null,
    },
  });
  res.json({ scan });
});

// ─── Recipes ──────────────────────────────────────────────────────────────────

app.get("/recipes", authMiddleware, async (req: AuthRequest, res) => {
  const { savedOnly } = req.query;
  const rows = await prisma.recipe.findMany({
    where: { userId: req.userId, ...(savedOnly === "true" ? { saved: true } : {}) },
    orderBy: { createdAt: "desc" },
  });
  // Parse JSON-stored arrays
  const recipes = rows.map((r: any) => ({
    ...r,
    ingredients: tryParseJson(r.ingredients, []),
    steps: tryParseJson(r.steps, []),
  }));
  res.json({ recipes });
});

app.post("/recipes", authMiddleware, async (req: AuthRequest, res) => {
  const { name, steps, ingredients, calories, protein, carbs, fat, goal } = req.body || {};
  if (!name || !steps || !ingredients) return res.status(400).json({ error: "name, steps and ingredients required" });
  const recipe = await prisma.recipe.create({
    data: {
      id: createId(),
      userId: req.userId as string,
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
  res.json({ recipe: { ...recipe, ingredients: tryParseJson(recipe.ingredients, []), steps: tryParseJson(recipe.steps, []) } });
});

app.patch("/recipes/:id/save", authMiddleware, async (req: AuthRequest, res) => {
  const recipe = await prisma.recipe.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!recipe) return res.status(404).json({ error: "Recipe not found" });
  const updated = await prisma.recipe.update({ where: { id: recipe.id }, data: { saved: !recipe.saved } });
  res.json({ recipe: updated });
});

app.delete("/recipes/:id", authMiddleware, async (req: AuthRequest, res) => {
  await prisma.recipe.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  res.json({ ok: true });
});

// ─── Badges ───────────────────────────────────────────────────────────────────

app.get("/me/badges", authMiddleware, async (req: AuthRequest, res) => {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: req.userId },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });
  res.json({ badges: userBadges });
});

// ─── Dumbbell Wallet ──────────────────────────────────────────────────────────

app.get("/wallet", authMiddleware, async (req: AuthRequest, res) => {
  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId: req.userId } });
  res.json({ wallet });
});

app.get("/wallet/transactions", authMiddleware, async (req: AuthRequest, res) => {
  const transactions = await prisma.dumbbellTransaction.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ transactions });
});

// ─── Quests ───────────────────────────────────────────────────────────────────

app.get("/quests", authMiddleware, async (req: AuthRequest, res) => {
  const quests = await prisma.quest.findMany({ orderBy: { frequency: "asc" } });
  const periodKeys = [...new Set(quests.map((q: any) => getPeriodKey(q.frequency)))];

  const progress = await prisma.userQuestProgress.findMany({
    where: {
      userId: req.userId,
      questId: { in: quests.map((q: any) => q.id) },
      periodKey: { in: periodKeys as string[] },
    },
  });

  const result = quests.map((q: any) => ({
    ...q,
    userProgress: progress.find((p: any) => p.questId === q.id && p.periodKey === getPeriodKey(q.frequency)) ?? null,
  }));
  res.json({ quests: result });
});

app.post("/quests/:code/claim", authMiddleware, async (req: AuthRequest, res) => {
  const quest = await prisma.quest.findUnique({ where: { code: req.params.code } });
  if (!quest) return res.status(404).json({ error: "Quest not found" });

  const periodKey = getPeriodKey(quest.frequency);
  const progressRecord = await prisma.userQuestProgress.findUnique({
    where: { userId_questId_periodKey: { userId: req.userId as string, questId: quest.id, periodKey } },
  });
  if (!progressRecord?.completed) return res.status(400).json({ error: "Quest not completed" });
  if (progressRecord.claimedAt)   return res.status(400).json({ error: "Already claimed" });

  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId: req.userId } });
  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  const [updatedWallet] = await prisma.$transaction([
    prisma.dumbbellWallet.update({
      where: { userId: req.userId },
      data: {
        balance:     { increment: quest.reward },
        totalEarned: { increment: quest.reward },
        xp:          { increment: quest.xpReward },
      },
    }),
    prisma.dumbbellTransaction.create({
      data: {
        id:           createId(),
        userId:       req.userId as string,
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

  res.json({ wallet: updatedWallet });
});

// ─── Shop / Borders ───────────────────────────────────────────────────────────

app.get("/shop/borders", authMiddleware, async (req: AuthRequest, res) => {
  const [borders, owned] = await Promise.all([
    prisma.border.findMany({ orderBy: { cost: "asc" } }),
    prisma.userBorder.findMany({ where: { userId: req.userId }, select: { borderId: true } }),
  ]);
  const ownedIds = new Set(owned.map((o: any) => o.borderId));
  res.json({ borders: borders.map((b: any) => ({ ...b, owned: ownedIds.has(b.id) })) });
});

app.post("/shop/borders/:code/buy", authMiddleware, async (req: AuthRequest, res) => {
  const border = await prisma.border.findUnique({ where: { code: req.params.code } });
  if (!border) return res.status(404).json({ error: "Border not found" });

  const alreadyOwned = await prisma.userBorder.findUnique({
    where: { userId_borderId: { userId: req.userId as string, borderId: border.id } },
  });
  if (alreadyOwned) return res.status(409).json({ error: "Already owned" });

  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId: req.userId } });
  if (!wallet || wallet.balance < border.cost) return res.status(400).json({ error: "Insufficient balance" });

  const [updatedWallet] = await prisma.$transaction([
    prisma.dumbbellWallet.update({
      where: { userId: req.userId },
      data: { balance: { decrement: border.cost } },
    }),
    prisma.dumbbellTransaction.create({
      data: {
        id:           createId(),
        userId:       req.userId as string,
        amount:       -border.cost,
        reason:       `border:${border.code}`,
        balanceAfter: wallet.balance - border.cost,
      },
    }),
    prisma.userBorder.create({
      data: { id: createId(), userId: req.userId as string, borderId: border.id },
    }),
  ]);

  res.json({ wallet: updatedWallet, border });
});

app.patch("/me/border", authMiddleware, async (req: AuthRequest, res) => {
  const { borderId } = req.body || {};
  if (borderId) {
    const owned = await prisma.userBorder.findUnique({
      where: { userId_borderId: { userId: req.userId as string, borderId } },
    });
    if (!owned) return res.status(403).json({ error: "Border not owned" });
  }
  const profile = await prisma.profile.update({
    where: { userId: req.userId },
    data: { activeBorderId: borderId ?? null },
  });
  res.json({ profile });
});

// ─── XP Boosts ────────────────────────────────────────────────────────────────

app.get("/boosts", authMiddleware, async (req: AuthRequest, res) => {
  const boosts = await prisma.xpBoost.findMany({
    where: { userId: req.userId, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "asc" },
  });
  res.json({ boosts });
});

app.post("/boosts", authMiddleware, async (req: AuthRequest, res) => {
  const { multiplier, durationHours, cost } = req.body || {};
  if (!multiplier || !durationHours || cost == null) {
    return res.status(400).json({ error: "multiplier, durationHours and cost required" });
  }
  const wallet = await prisma.dumbbellWallet.findUnique({ where: { userId: req.userId } });
  if (!wallet || wallet.balance < cost) return res.status(400).json({ error: "Insufficient balance" });

  const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);
  const [updatedWallet, boost] = await prisma.$transaction([
    prisma.dumbbellWallet.update({
      where: { userId: req.userId },
      data: { balance: { decrement: cost } },
    }),
    prisma.xpBoost.create({
      data: { id: createId(), userId: req.userId as string, multiplier, expiresAt },
    }),
    prisma.dumbbellTransaction.create({
      data: {
        id:           createId(),
        userId:       req.userId as string,
        amount:       -cost,
        reason:       `boost:${multiplier}x`,
        balanceAfter: wallet.balance - cost,
      },
    }),
  ]);

  res.json({ boost, wallet: updatedWallet });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`TwinFit API listening on http://localhost:${port}`);
});
