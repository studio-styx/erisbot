import { prisma } from "#database";
import { Prisma } from "#prisma";

const blacklist: string[] = [];

export type PrismaBlacklistValue = {
    bannedAt: Date;
    reason: string;
    endAt: Date | null;
    responsibleId: string;
}

export async function addToBlacklist(id: string, { reason, endAt, responsibleId } : PrismaBlacklistValue) {
    await prisma.user.upsert({
        where: {
            id
        },
        update: {
            blacklist: {
                bannedAt: new Date(),
                reason,
                endAt,
                responsibleId   
            }
        },
        create: {
            id,
            blacklist: {
                bannedAt: new Date(),
                reason,
                endAt,
                responsibleId   
            }
        }
    })
    blacklist.push(id);
}

export async function removeFromBlacklist(id: string, deleteUser: boolean = false) {
    if (deleteUser) {
        await prisma.user.delete({
            where: {
                id
            }
        })
    } else {
        await prisma.user.update({
            where: {
                id
            },
            data: {
                blacklist: Prisma.JsonNull
            }
        })
    }
    blacklist.splice(blacklist.indexOf(id), 1);
}

export function isBlacklisted(id: string) {
    return blacklist.includes(id);
}

export async function setAllBlacklistedUsers() {
    const users = await prisma.user.findMany({
        where: {
            blacklist: { not: Prisma.JsonNull }
        }
    })
    for (const user of users) {
        blacklist.push(user.id);
    }
}