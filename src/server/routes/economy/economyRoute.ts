import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export async function economyRoute(app: FastifyInstance, client: Client<true>){
    app.post("/economy/give-stx", async (req, res) => {
        const giveStxBodySchema = z.object({
            guildId: z.string().min(1),
            channelId: z.string().min(1),
            memberId: z.string().min(1),
            amount: z.number().min(1),
            reason: z.string().min(1)
        })

        const { guildId, channelId, memberId, amount, reason } = giveStxBodySchema.parse(req.body);

        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(StatusCodes.NOT_FOUND).send({ message: "Guild not found" });
            const channel = await guild.channels.fetch(channelId);
            if (!channel) return res.status(StatusCodes.NOT_FOUND).send({ message: "Channel not found" });
            const member = await guild.members.fetch(memberId);
            if (!member) return res.status(StatusCodes.NOT_FOUND).send({ message: "Member not found" });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
        
        }
    });
}