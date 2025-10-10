import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function info(app: FastifyInstance, _client: Client<true>) {
    app.get<{ Params: { giveawayId: string } }>("/info/:giveawayId",  async (req, reply) => {
        if (!req.application || ( !req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("GIVEAWAY.INFO.READ") )) {
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "You do not have permission to see a giveaway info", success: false });
        }

        const { giveawayId } = req.params;
        
        const giveaway = await prisma.giveaway.findUnique({
            where: { id: +giveawayId },
            include: {
                connectedGuilds: true,
                participants: true,
                roleEntries: true
            }
        });

        if (!giveaway) {
            return reply.status(StatusCodes.NOT_FOUND).send({ message: "Giveaway not found" });
        }

        return reply.status(StatusCodes.OK).send(giveaway)
    })
}