import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  // eslint-disable-next-line no-var
  var _prismaInstance: any;
}

function createPrismaClient() {
  // DATABASE_URL must be the Prisma Accelerate URL (prisma+postgres://...)
  return new PrismaClient().$extends(withAccelerate());
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
