import { asPrisma, prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function generateApiKey(app: FastifyInstance, _client: Client<true>) {
    app.delete<{ Params: { botId: string } }>("/apiKey/:botId", async (req, reply) => {
        const user = req.userId;
        const botId = req.params.botId;

        const [bot, info] = await Promise.all([
            asPrisma.application.findUnique({
                where: { id: botId },
                select: { userId: true }
            }),
            prisma.application.findUnique({
                where: { id: botId },
            })
        ])

        if (!bot || !info) return reply.status(StatusCodes.NOT_FOUND).send({ error: "Bot not found" });

        if (bot.userId !== user) return reply.status(StatusCodes.FORBIDDEN).send({ error: "You are not the owner of this bot" });

        
    

        await prisma.application.update({
            where: { id: botId },
            data: { token: null }
        });

        return reply.status(StatusCodes.OK).send({ message: "API key deleted" });
    })
}