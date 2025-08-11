import { Client } from "discord.js";
import { FastifyInstance } from "fastify";

export default async function guildsRoute(app: FastifyInstance, client: Client<true>) {
    app.get("/", async (_req, reply) => {
        const guilds = client.guilds.cache;

        return reply.status(200).send(guilds)
    })
}