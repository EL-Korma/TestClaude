import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { normalizeEmail } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json().catch(() => ({}));
  if (!identifier || !password) {
    return Response.json({ error: "Missing credentials" }, { status: 400 });
  }
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: normalizeEmail(identifier) }, { username: identifier }, { phone: identifier }] },
  });
  if (!user) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return Response.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signToken(user.id);
  return Response.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email } });
}
