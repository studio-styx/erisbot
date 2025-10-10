import { Store } from "#base";
import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

const store = new Store();

export default async function cacheManagement(app: FastifyInstance, _client: Client<true>) {
    app.get("/cache",  async (req, reply) => {
        const application = req.application?.data;

        if (!application) return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error", success: false });

        if (store.has(application.id)) return reply.status(StatusCodes.TOO_MANY_REQUESTS).send({ message: "Too many requests", success: false });

        store.set(application.id, true, { time: 1000 * 60 * 10});

        const giveaways = await prisma.giveaway.findMany({
            where: {
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                connectedGuilds: true,
                participants: true,
                roleEntries: true
            }
        });

        return reply.status(200).send({
            money: application.money.toNumber(),
            permissions: application.permissions,
            giveaways
        })
    })
}