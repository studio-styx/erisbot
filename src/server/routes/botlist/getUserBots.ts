import { asPrisma, dzonePrisma } from "#database";
import { getJwtToken } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";

interface Query {
    get?: string;
}

export default function getUserBotsRoute(app: FastifyInstance, client: Client<true>) {
    app.get<{ Params: { server: string }, Querystring: Query }>("/user/getbots/:server", async (req, reply) => {
        const server = req.params.server;
        if (!server || (server !== "eris" && server !== "devzone")) return reply.status(400).send({ error: "Invalid server" });
        const token = req.cookies.auth;
        if (!token) return reply.status(401).send({ error: "Not logged in" });
        const userId = getJwtToken(token);
        if (!userId) return reply.status(401).send({ error: "Invalid token" });

        const applications = server === "eris" ? await asPrisma.application.findMany({
            where: { userId },
            include: {
                analyze: true
            }
        }) : await dzonePrisma.application.findMany({
            where: { userId },
            include: {
                analyze: true
            }
        }) as any[];

        const gets = req.query.get?.split(/[\s+]+/).filter(Boolean) || [];

        if (gets.includes("discordBot")) {
            for (const app of applications) {
                const discordApp = await client.users.fetch(app.id).catch(() => null);
                if (!discordApp) continue;
                app.discordBot = discordApp;
            }
        }

        return reply.send({
            applications
        });
    });
};