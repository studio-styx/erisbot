import { PrismaClient } from "#prisma";

const prisma = new PrismaClient()

export async function registerLog(message: string, type: "error" | "warn" | "info" | "debug", level: number = 0, user: string, name: string = "action") {
    if (process.env.NODE_ENV === "development") return;
    const result = await prisma.log.create({
        data: {
            message,
            type,
            level,
            userId: user,
            name,
        }
    })

    return result
}