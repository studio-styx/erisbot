import { prisma } from "#database";
import { res, icon } from "#functions";
import { Client, userMention } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export default async function giveStx(app: FastifyInstance, client: Client<true>) {
    app.post("/give-stx", async (req, reply) => {
        const giveStxBodySchema = z.object({
            guildId: z.string().min(1),
            channelId: z.string().min(1),
            memberId: z.string().min(1),
            amount: z.number().min(1),
            reason: z.string().min(1).optional()
        })

        const { guildId, channelId, memberId, amount, reason } = giveStxBodySchema.parse(req.body);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Guild not found", success: false });
        const channel = await guild.channels.fetch(channelId);
        if (!channel) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Channel not found", success: false });
        const member = await guild.members.fetch(memberId);
        if (!member || member.user.bot) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Member not found", success: false });

        const application = req.application;

        if (!application) return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error", success: false });

        const botMember = await guild.members.fetch(application.data.id);
        if (!botMember) return reply.status(StatusCodes.NOT_FOUND).send({ message: "You are not on this server", success: false });
        if (!botMember.permissionsIn(channel).has("SendMessages")) return reply.status(StatusCodes.FORBIDDEN).send({ message: "You does not have permission to send messages in this channel", success: false })

        const appMoney = application.data.money.toNumber();

        if (appMoney < amount) return reply.status(StatusCodes.BAD_REQUEST).send({ message: "Not enough money", success: false });

        await prisma.$transaction([
            prisma.application.update({
                where: { token: application.tokenHash },
                data: { money: { decrement: amount } }
            }),
            prisma.user.upsert({
                where: { id: memberId },
                update: { money: { increment: amount } },
                create: { id: memberId, money: amount }
            }),
            prisma.log.create({
                data: {
                    message: `Recebeu dinheiro da aplicação: ${userMention(application.data.id)} com o motivo: ${reason ?? "Nenhum motivo fornecido"}`,
                    level: 7,
                    type: "info",
                    userId: memberId,
                    tags: ["economy", "transfer", "receive", "api", "transaction"]
                }
            })
        ])

        if (channel.isSendable()) {
            await channel.send(res.fuchsia(`${icon.Eris_happy} | ${userMention(application.data.id)} deu: **${amount}** stx para o usuário: **${userMention(memberId)}** com o motivo: **\`${reason ?? "Nenhum motivo fornecido"}\`**`))
        }

        return reply.status(StatusCodes.OK).send({ message: "Success", success: true });
    });
}