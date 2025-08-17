import { asPrisma, dzonePrisma } from "#database";
import { getJwtToken } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";

interface Query {
    get?: string;
}

export default function getBotsRoute(app: FastifyInstance, client: Client<true>) {
    app.get<{ Params: { server: string, botId: string }, Querystring: Query }>("/getbot/:botId/:server", async (req, reply) => {
        const server = req.params.server;
        const botId = req.params.botId;
        if (!server || (server !== "eris" && server !== "devzone" && server !== "all")) return reply.status(400).send({ error: "Invalid server" });
        const token = req.cookies.auth;
        if (!token) return reply.status(401).send({ error: "Not logged in" });
        const userId = getJwtToken(token);
        if (!userId) return reply.status(401).send({ error: "Invalid token" });

        const application = server === "eris" ? await asPrisma.application.findUnique({
            where: { id: botId },
            include: {
                analyze: true,
                votes: true
            }
        }) : await dzonePrisma.application.findUnique({
            where: { id: botId },
            include: {
                analyze: true,
                votes: true
            }
        }) as any

        if (!application) return reply.status(404).send({ error: "Application not found" })

        const gets = req.query.get?.split(/[\s+]+/).filter(Boolean) || [];

        if (gets.includes("discordBot")) {
            const discordApp = await client.users.fetch(application.id, { cache: true }).catch(() => null);
            application.discordBot = discordApp;
        }
        if (gets.includes("owner")) {
            const owner = server === "eris" ? await asPrisma.user.findUnique({
                where: { id: application.userId },
            }) : await dzonePrisma.user.findUnique({
                where: { id: application.userId },
            });
            application.owner = owner;
            if (gets.includes("discordOwner")) {
                if (owner) {
                    const discordOwner = await client.users.fetch(owner.id, { cache: true }).catch(() => null);
                    application.discordOwner = discordOwner;
                } else {
                    application.discordOwner = null;
                }
            }
        }

        return reply.send({
            application
        });
    });
};