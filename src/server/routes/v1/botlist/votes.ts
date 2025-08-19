import { asPrisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function votes(app: FastifyInstance, _client: Client<true>) {
    app.get("/votes", async (req, reply) => {
        const id = req.application?.data.id;

        if (!id) {
            return reply.status(StatusCodes.BAD_REQUEST).send({ message: "Application not found" });
        }

        const app = await asPrisma.application.findUnique({
            where: { id },
            select: { votes: true }
        });

        if (!app) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Application not found" });

        return reply.status(StatusCodes.OK).send({ votes: app.votes.length, votesData: app.votes });
    })
}