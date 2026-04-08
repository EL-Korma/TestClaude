import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: any };

function createPrisma() {
  return (new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  })).$extends(withAccelerate()) as any;
}

export const prisma: any = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
