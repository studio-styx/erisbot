import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function info(app: FastifyInstance, client: Client<true>) {
    app.get<{ Params: { userId: string } }>("/info/:userId",  async (req, reply) => {
        if (!req.application || ( !req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("USER.INFO.READ") )) {
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "You do not have permission to see the info from a user", success: false });
        }

        const { userId } = req.params;

        const discordUser = await client.users.fetch(userId, { cache: true }).catch(() => null);

        if (!discordUser) {
            return reply.status(StatusCodes.NOT_FOUND).send({ message: "User not found" });
        }

        if (discordUser.bot) return reply.status(StatusCodes.FORBIDDEN).send({ message: "You cannot see the info from a bot", success: false });

        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
            include: {
                stocks: true,
                fishs: true,
                fishingRods: true,
                cooldowns: true,
                company: true,
                giveaways: true,
                activePet: {
                    include: {
                        genetics: { include: { gene: true } },
                        skills: { include: { skill: true } },
                        personality: { include: { trait: true } },
                    }
                },
                pets: {
                    where: {
                        adoption: null,
                        isDead: false,
                    },
                    include: {
                        genetics: { include: { gene: true } },
                        skills: { include: { skill: true } },
                        personality: { include: { trait: true } },
                    }
                },
            }
        });

        return reply.status(StatusCodes.OK).send({
            ...user,
            discord: discordUser,
            token: undefined
        })
    })
}