import { prisma } from "#database";
import { Prisma } from "#prisma";

// overloads
export async function getValidUserPet<
    T extends { select?: Prisma.UserPetSelect; include?: Prisma.UserPetInclude }
>(petId: number, userId?: string, args?: T): Promise<Prisma.UserPetGetPayload<T> | null>;

export async function getValidUserPet<
    T extends { select?: Prisma.UserPetSelect; include?: Prisma.UserPetInclude }
>(petId: string, args?: T): Promise<Prisma.UserPetGetPayload<T>[]>;

// implementação
export async function getValidUserPet<
    T extends { select?: Prisma.UserPetSelect; include?: Prisma.UserPetInclude }
>(petId: number | string, userId: string | undefined = undefined, args?: T) {
    if (typeof petId === "string") {
        return await prisma.userPet.findMany({
            where: {
                userId: petId,
                adoption: null,
                isDead: false,
            },
            ...args,
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    return await prisma.userPet.findUnique({
        where: {
            userId,
            id: petId,
            adoption: null,
            isDead: false,
        },
        ...args,
    });
}
