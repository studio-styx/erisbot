import { asPrisma, prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import crypto from "node:crypto";

export default async function generateApiKey(app: FastifyInstance, _client: Client<true>) {
    app.post<{ Params: { botId: string } }>("/apiKey/:botId", async (req, reply) => {
        const user = req.userId;
        const botId = req.params.botId;

        const bot = await asPrisma.application.findUnique({
            where: { id: botId },
            select: { userId: true, carefulAnalysis: true }
        });

        if (!bot) return reply.status(StatusCodes.NOT_FOUND).send({ error: "Bot not found" });

        if (bot.userId !== user) return reply.status(StatusCodes.FORBIDDEN).send({ error: "You are not the owner of this bot" });
        if (!bot.carefulAnalysis) return reply.status(StatusCodes.FORBIDDEN).send({ error: "This bot does not have careful analysis" });

        const apiKey = crypto.randomBytes(32).toString("hex");
        const apiHash = crypto.createHash("sha256").update(apiKey).digest("hex");

        await prisma.application.upsert({
            where: { id: botId },
            update: { token: apiHash },
            create: { id: botId, token: apiHash, ownerId: user, money: 500 }
        });

        return reply.status(StatusCodes.OK).send({ apiKey });
    })
}