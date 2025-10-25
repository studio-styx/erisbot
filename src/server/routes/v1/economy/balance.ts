import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export default async function balance(app: FastifyInstance, client: Client<true>) {
    app.get("/balance/:userId", async (req, reply) => {
        const { userId } = z.object({
            userId: z.string().min(1)
        }).parse(req.params);

        const discordUser = await client.users.fetch(userId, { cache: true }).catch(() => null);

        if (!discordUser) {
            return reply.status(StatusCodes.NOT_FOUND).send({ message: "User not found" });
        }

        const user = await prisma.user.upsert({
            where: { id: userId },
            update: { id: userId },
            create: { id: userId }
        });

        return reply.status(StatusCodes.OK).send({ money: user.money.toNumber() });
    });
    app.get("/balance", async (req, reply) => {
        const app = req.application;

        if (!app) return reply.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });

        return reply.status(StatusCodes.OK).send({
            money: app.data.money.toNumber(),
        })
    })
}