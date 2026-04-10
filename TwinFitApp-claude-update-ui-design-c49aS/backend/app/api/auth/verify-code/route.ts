import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json().catch(() => ({}));
  if (!email || !code) {
    return Response.json({ error: "Email and code required" }, { status: 400 });
  }

  const normalizedEmail = normalizeEmail(email);
  const record = await prisma.verificationCode.findFirst({
    where: { email: normalizedEmail, code },
  });

  if (!record) {
    return Response.json({ error: "Invalid verification code" }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    return Response.json({ error: "Code expired — request a new one" }, { status: 400 });
  }

  // Delete code after successful verification (one-time use)
  await prisma.verificationCode.delete({ where: { id: record.id } });
  return Response.json({ verified: true });
}
