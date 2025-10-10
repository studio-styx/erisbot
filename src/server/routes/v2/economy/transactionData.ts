import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function transaction(app: FastifyInstance, _client: Client<true>) {
    app.get<{ Params: { transactionId: string } }>("/transaction/:transactionId", async (req, reply) => {
        if (!req.application || ( !req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("ECONOMY.READ") )) {
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "You do not have permission to see the transaction", success: false });
        }

        const { transactionId } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) }
        });

        if (!transaction) {
            return reply.status(404).send({ message: "Transaction not found" });
        }

        return reply.status(200).send({ data: transaction });
    })
}