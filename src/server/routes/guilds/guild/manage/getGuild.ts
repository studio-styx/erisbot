import { prisma } from "#database";
import { getJwtToken } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function manageGuildRoute(app: FastifyInstance, client: Client<true>) {
    app.get<{ Params: { guildId: string } }>("/:guildId", async (req, reply) => {
        const { guildId } = req.params;

        const guild = client.guilds.cache.get(guildId);

        if (!guild) return reply.status(404).send({ error: "Guild not found" })

        const token = req.cookies.auth;
        if (!token) return reply.status(401).send({ error: "Not logged in" });

        const userId = getJwtToken(token);
        if (!userId) return reply.status(401).send({ error: "Invalid token" });

        const member = await guild.members.fetch(userId);
        if (!member) return reply.status(401).send({ error: "User not in guild" });
        if (!member.permissions.has("ManageGuild")) return reply.status(StatusCodes.FORBIDDEN).send({ error: "You don't have permission to manage this guild" });

        const guildSettings = await prisma.guildSettings.upsert({
            where: {
                id: guild.id
            },
            create: { id: guild.id },
            update: {}
        });

        const safeJsonParse = (jsonString: string | null | undefined) => {
            try {
                return JSON.parse(jsonString || "[]");
            } catch (error) {
                return []; // Retorna um array vazio se falhar
            }
        };

        if (!guildSettings) {
            return reply.status(500).send({ error: "Failed to load guild settings" });
        }

        return reply.status(200).send({
            settings: {
                ...guildSettings,
                rolesXpBonus: safeJsonParse(guildSettings.rolesXpBonus as string),
                channelsXpBonus: safeJsonParse(guildSettings.channelsXpBonus as string),
                levelGrant: safeJsonParse(guildSettings.levelGrant as string),
            },
            guild,
        });
    })
}