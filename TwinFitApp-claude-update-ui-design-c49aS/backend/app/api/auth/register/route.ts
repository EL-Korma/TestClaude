import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { normalizeEmail } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  const { name, surname, username, email, phone, password } = await req.json().catch(() => ({}));
  if (!name || !surname || !username || !email || !password) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
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
  if (existing) return Response.json({ error: "User already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = createId();
  const user = await prisma.user.create({
    data: { id: userId, name, surname, username, email: normalizedEmail, phone, passwordHash },
  });
  await Promise.all([
    prisma.profile.create({ data: { id: createId(), userId: user.id } }),
    prisma.dumbbellWallet.create({ data: { id: createId(), userId: user.id } }),
  ]);

  const token = signToken(user.id);
  return Response.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
}
