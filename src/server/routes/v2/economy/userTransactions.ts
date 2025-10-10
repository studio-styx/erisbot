import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export default async function transactions(app: FastifyInstance, _client: Client<true>) {
    app.get<{ Params: { userId: string }, Query: { limit?: number, timeLimit?: Date } }>("/transactions/:userId", async (req, reply) => {
        if (!req.application || ( !req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("ECONOMY.READ") )) {
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "You do not have permission to see the user transactions", success: false });
        }

        const { userId } = z.object({
            userId: z.string().min(1)
        }).parse(req.params);

        const transactionsLogsBodySchema = z.object({
            limit: z.number().min(1).max(30).optional(),
            timeLimit: z.date().optional()
        });

        const body = req.query ? transactionsLogsBodySchema.parse(req.query) : {};

        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { userId },
                    { targetId: userId }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            take: body.limit ?? 40
        });

        return reply.status(StatusCodes.OK).send({ data: transactions });

    })
}