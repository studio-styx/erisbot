import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export default async function transactions(app: FastifyInstance, _client: Client<true>) {
    app.post("/transactions/:userId", async (req, reply) => {
        const { userId } = z.object({
            userId: z.string().min(1)
        }).parse(req.params);

        const transactionsLogsBodySchema = z.object({
            limit: z.number().min(1).max(30).optional(),
            timeLimit: z.date().optional()
        });

        const body = req.body ? transactionsLogsBodySchema.parse(req.body) : {};

        const logs = await prisma.log.findMany({
            where: {
                userId,
                type: "info",
                timestamp: {
                    gte: body.timeLimit ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
                },
                tags: {
                    has: "transaction"
                }
            },
            orderBy: {
                timestamp: "desc"
            },
            take: body.limit ?? 40
        });

        return reply.status(StatusCodes.OK).send({ data: logs });

    })
}