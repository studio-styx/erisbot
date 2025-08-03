import { PrismaClient } from "#prisma";

const prisma = new PrismaClient()

export async function registerLog(options: {
    message: string;
    type: "error" | "warn" | "info" | "debug";
    level: number;
    user: string;
    tags: string[]
}) {
    const result = await prisma.log.create({
        data: {
            message: options.message,
            type: options.type,
            level: options.level,
            userId: options.user,
            tags: options.tags
        }
    })

    return result
}