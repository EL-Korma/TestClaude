import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  // eslint-disable-next-line no-var
  var _prismaInstance: any;
}

function createPrismaClient() {
  // Prisma 7 + Accelerate requires accelerateUrl in the constructor.
  // Not in TypeScript types so cast via any.
  const client = new (PrismaClient as any)({ accelerateUrl: process.env.DATABASE_URL });
  return client.$extends(withAccelerate());
}

function getClient() {
  if (!global._prismaInstance) {
    global._prismaInstance = createPrismaClient();
  }
  return global._prismaInstance;
}

// Lazy proxy — PrismaClient is NOT instantiated at import time.
// It is created only when a property (e.g. prisma.user) is first accessed,
// which happens at request time rather than at Next.js build time.
export const prisma: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return getClient()[prop];
    },
  }
);
