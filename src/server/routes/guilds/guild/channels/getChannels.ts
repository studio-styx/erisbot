import { Client } from "discord.js";
import { FastifyInstance } from "fastify";

export default async function getChannelsRoute(app: FastifyInstance, client: Client<true>) {
    app.get<{ Params: { guildId: string } }>("/:guildId", async (req, reply) => {
        const { guildId } = req.params;

        const guild = client.guilds.cache.get(guildId);

        if (!guild) return reply.status(404).send({ error: "Guild not found" })

        const channels = await guild.channels.fetch();

        return reply.status(200).send(channels);
    })
}