import { NextRequest } from "next/server";
import { Resend } from "resend";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/helpers";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const normalizedEmail = normalizeEmail(email);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Remove any existing codes for this email and store the new one
  await prisma.verificationCode.deleteMany({ where: { email: normalizedEmail } });
  await prisma.verificationCode.create({
    data: { id: createId(), email: normalizedEmail, code, expiresAt },
  });

  // Send via Resend SDK
  const { error } = await resend.emails.send({
    from: "TwinFit <onboarding@resend.dev>",
    to: [normalizedEmail],
    subject: "Verify your TwinFit account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D0D0D;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:#FF5E1A;margin:0 0 8px">TwinFit</h2>
        <p style="color:#aaa;margin:0 0 24px">Your verification code:</p>
        <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#FF5E1A;margin:24px 0;text-align:center">${code}</div>
        <p style="color:#666;font-size:13px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
    tags: [{ name: "category", value: "email-verification" }],
  });

  if (error) {
    console.error("Resend error:", error);
    // Still return success — code is stored in DB so user can request resend
  }

  // In development, return the code directly for easy testing
  const devCode = process.env.NODE_ENV === "development" ? { _dev_code: code } : {};
  return Response.json({ sent: true, ...devCode });
}
