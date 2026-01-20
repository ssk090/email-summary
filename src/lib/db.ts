import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please check your .env file."
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
  });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = globalForPrisma.prisma;
}

export const prisma = globalForPrisma.prisma;
