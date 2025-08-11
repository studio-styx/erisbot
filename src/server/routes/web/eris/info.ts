import { Client } from "discord.js";
import { FastifyInstance } from "fastify";

export default async function botInfoRoute(app: FastifyInstance, client: Client<true>) {
    app.get("/avatar", async (_req, reply) => {
        const avatarUrl = client.user.avatarURL()

        return reply.status(200).send({ avatarUrl })
    })
}