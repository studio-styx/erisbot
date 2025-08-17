import { asPrisma, dzonePrisma } from "#database";
import { getJwtToken } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import z from "zod";

interface Query {
    get?: string;
}

export default function updateBot(app: FastifyInstance, _client: Client<true>) {
    app.put<{ Params: { server: string, botId: string }, Querystring: Query }>("/update/:botId/:server", async (req, reply) => {
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
        });

        if (!application) return reply.status(404).send({ error: "Application not found" });
        if (userId !== application.userId) return reply.status(403).send({ error: "You are not the owner of this application" })
        
        const updateBotSchemaBody = z.object({
            description: z.string().min(50).max(300),
            prefix: z.string().min(1).max(4).optional(),
            language: z.enum(["Javascript", "Typescript", "Java", "Kotlin", "BDFD", "Golang", "Rust", "Ruby", "Python"]),
            lib: z.string().min(1),
            website: z.string().url().optional(),
            github: z.string().url().optional(),
            supportServerLink: z.string().url().optional(),
            hasSlashCommands: z.boolean().optional(),
        })

        const body = updateBotSchemaBody.parse(req.body);

        const newApplication = server === "eris" ? await asPrisma.application.update({
            where: { id: botId },
            data: {
                description: body.description,
                prefix: body.prefix,
                language: body.language,
                lib: body.lib,
                website: body.website,
                github: body.github,
                supportServerLink: body.supportServerLink,
                hasSlashCommands: body.hasSlashCommands,
            }
        }) : await dzonePrisma.application.update({
            where: { id: botId },
            data: {
                description: body.description,
                prefix: body.prefix,
                language: body.language,
                lib: body.lib,
                website: body.website,
                github: body.github,
                supportServerLink: body.supportServerLink,
                hasSlashCommands: body.hasSlashCommands,
            }
        });

        return reply.status(200).send({ message: "Application updated", application: newApplication });
    });
};