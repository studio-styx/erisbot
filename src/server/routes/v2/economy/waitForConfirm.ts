import { prisma } from "#database";
import { calculateDate } from "#functions";
import { TransactionStatus } from "#prisma";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function transaction(app: FastifyInstance, _client: Client<true>) {
    app.patch<{ Params: { transactionId: string } }>("/transaction/wait/:transactionId", async (req, reply) => {
        if (!req.application || ( !req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("ECONOMY.WRITE") )) {
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "you do not have permission to wait for a transaction", success: false });
        }
        const { transactionId } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) }
        });

        if (!transaction) {
            return reply.status(404).send({ message: "Transaction not found" });
        }

        if (transaction.status !== "PENDING") {
            return reply.status(400).send({ message: "Transaction is not pending" });
        }

        if (!transaction.expiresAt || transaction.expiresAt > calculateDate({ time: "5m", typeCalc: "increment" })) {
            return reply.status(400).send({ message: "Transaction time is too long" });
        }

        if (transaction.expiresAt < new Date()) {
            await prisma.transaction.update({
                where: { id: parseInt(transactionId) },
                data: { status: "EXPIRED" }
            });

            return reply.status(400).send({ message: "Transaction time is expired" });
        }

        const expiresAtSeconds = transaction.expiresAt.getTime() / 1000;
        const intervealTime = expiresAtSeconds < 30 ? 1 : expiresAtSeconds < 60 ? 3 : 5;

        const waitForConfirmation = (): Promise<TransactionStatus | "DELETED"> => {
            return new Promise((resolve) => {
                const interval = setInterval(async () => {
                    const freshTransaction = await prisma.transaction.findUnique({
                        where: { id: parseInt(transactionId) }
                    });

                    if (!freshTransaction) {
                        clearInterval(interval);
                        resolve("DELETED");
                        return;
                    }

                    if (freshTransaction.status !== "PENDING") {
                        clearInterval(interval);
                        resolve(freshTransaction.status);
                        return;
                    }
                }, intervealTime * 1000);
            });
        }

        const result = await waitForConfirmation();

        return reply.status(200).send({ status: result });
    })
}