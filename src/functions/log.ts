import { PrismaClient } from "#prisma";

const prisma = new PrismaClient()

export async function registerLog(message: string, type: "error" | "warn" | "info" | "debug", level: number = 0, user: string, name: string = "action") {
    if (process.env.NODE_ENV === "development") return;
    const result = await prisma.logs.create({
        data: {
            message,
            type,
            level,
            user,
            name,
        }
    })

    return result
}