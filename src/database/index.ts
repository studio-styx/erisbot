import { PrismaClient } from "#prisma";

export const prisma = new PrismaClient();
export * from "./erisHelper.js"
export * from "./devzone.js"