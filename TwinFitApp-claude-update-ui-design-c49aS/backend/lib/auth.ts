import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const jwtSecret = process.env.JWT_SECRET || "dev_secret";

export function getUserId(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    return payload.sub;
  } catch {
    return null;
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: "7d" });
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
