import { PrismaClient } from "#prisma";

export const prisma = new PrismaClient();
export * from "./astronautPrisma.js"