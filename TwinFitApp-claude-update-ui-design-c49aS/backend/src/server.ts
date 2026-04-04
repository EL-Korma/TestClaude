import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/client";

const app = express();
const prisma = new PrismaClient();

const jwtSecret = process.env.JWT_SECRET || "dev_secret";

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  const now = new Date().toISOString();
  res.json({ status: "ok", time: now });
});

type AuthRequest = express.Request & { userId?: string };

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

app.post("/auth/register", async (req, res) => {
  const { name, surname, username, email, phone, password } = req.body || {};
  if (!name || !surname || !username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username }, phone ? { phone } : undefined].filter(Boolean) as any,
    },
  });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, surname, username, email: normalizedEmail, phone, passwordHash },
  });
  await prisma.profile.create({ data: { userId: user.id } });

  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
});

app.post("/auth/login", async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) return res.status(400).json({ error: "Missing credentials" });

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizeEmail(identifier) }, { username: identifier }, { phone: identifier }],
    },
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
});

app.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { profile: true },
  });
  res.json({ user });
});

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const resolveStreakLevel = (current: number) => {
  if (current >= 28) return 4;
  if (current >= 14) return 3;
  if (current >= 7) return 2;
  return 1;
};

app.post("/checkins", authMiddleware, async (req: AuthRequest, res) => {
  const { groupId, photoUrl, capturedAt } = req.body || {};
  if (!photoUrl) return res.status(400).json({ error: "photoUrl required" });

  const timestamp = capturedAt ? new Date(capturedAt) : new Date();

  const checkIn = await prisma.checkIn.create({
    data: {
      userId: req.userId as string,
      groupId,
      photoUrl,
      capturedAt: timestamp,
      status: "VALIDATED",
    },
  });

  const currentStreak = await prisma.streak.findFirst({ where: { userId: req.userId } });
  let updatedUserStreak;
  if (currentStreak) {
    updatedUserStreak = await prisma.streak.update({
      where: { id: currentStreak.id },
      data: {
        current: { increment: 1 },
        weeklyCount: { increment: 1 },
        level: resolveStreakLevel((currentStreak?.current || 0) + 1),
      },
    });
  } else {
    updatedUserStreak = await prisma.streak.create({
      data: { userId: req.userId as string, current: 1, weeklyCount: 1, level: 1 },
    });
  }

  let groupStreak = null;
  if (groupId) {
    const { start, end } = getTodayRange();
    const members = await prisma.groupMember.findMany({ where: { groupId, status: "ACTIVE" } });
    const memberIds = members.map((m) => m.userId);
    const todayCheckIns = await prisma.checkIn.findMany({
      where: {
        groupId,
        userId: { in: memberIds },
        status: "VALIDATED",
        capturedAt: { gte: start, lte: end },
      },
    });
    const allDone = memberIds.length > 0 && memberIds.every((id) => todayCheckIns.some((c) => c.userId === id));
    if (allDone) {
      const currentGroupStreak = await prisma.streak.findFirst({ where: { groupId } });
      if (currentGroupStreak) {
        groupStreak = await prisma.streak.update({
          where: { id: currentGroupStreak.id },
          data: {
            current: { increment: 1 },
            weeklyCount: { increment: 1 },
            level: resolveStreakLevel((currentGroupStreak?.current || 0) + 1),
          },
        });
      } else {
        groupStreak = await prisma.streak.create({
          data: { groupId, current: 1, weeklyCount: 1, level: 1 },
        });
      }
    }
  }

  res.json({ checkIn, userStreak: updatedUserStreak, groupStreak });
});

app.get("/streaks/me", authMiddleware, async (req: AuthRequest, res) => {
  const streak = await prisma.streak.findFirst({ where: { userId: req.userId } });
  res.json({ streak });
});

app.get("/streaks/group/:groupId", authMiddleware, async (req: AuthRequest, res) => {
  const streak = await prisma.streak.findFirst({ where: { groupId: req.params.groupId } });
  res.json({ streak });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TwinFit API listening on http://localhost:${port}`);
});
