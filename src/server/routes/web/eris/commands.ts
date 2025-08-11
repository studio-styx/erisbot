import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import fs from "fs/promises";
import z from "zod";

interface Commands {
    name: string;
    description: string;
    siteAvaible: boolean;
    category: string;
}

export default async function commandsRoute(app: FastifyInstance, _client: Client<true>) {
    const file = await fs.readFile("commands.json", "utf-8");
    const commands = JSON.parse(file);
    const devId = "1171963692984844401"
    app.get("/commands", async (_req, reply) => {
        return reply.status(200).send(commands)
    })
    app.post("/commands", async (req, reply) => {
        if (req.userId !== devId) return reply.status(401).send({ error: "Unauthorized" })
        const commandBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            siteAvaible: z.boolean(),
            category: z.enum(["economy", "general", "cassino", "moderation", "investment"])
        });

        const command = commandBodySchema.parse(req.body);

        if (commands.some((c: Commands) => c.name === command.name)) return reply.status(400).send({ error: "Command already exists" })

        commands.push(command);

        await fs.writeFile("./commands.json", JSON.stringify(commands, null, 2));

        return reply.status(200).send({ message: "Command added" })
    })
    app.delete<{ Params: { name: string } }>("/commands/:name", async (req, reply) => {
        if (req.userId !== devId) return reply.status(401).send({ error: "Unauthorized" })
        const { name } = req.params;

        const command = commands.find((c: Commands) => c.name === name);

        if (!command) return reply.status(404).send({ error: "Command not found" })

        commands.splice(commands.indexOf(command), 1);

        await fs.writeFile("./commands.json", JSON.stringify(commands, null, 2));

        return reply.status(200).send({ message: "Command deleted" })
    })
}