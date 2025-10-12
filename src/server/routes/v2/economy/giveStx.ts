import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { res, icon, convertTime, calculateDate, scheduleTransactionExpires } from "#functions";
import { createRow, brBuilder } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, Client, time, userMention } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export default async function giveStx(app: FastifyInstance, client: Client<true>) {
    app.post("/give-stx", async (req, reply) => {
        if (!req.application || (!req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("ECONOMY.WRITE"))) {
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "You do not have permission to give stx to a user", success: false });
        }

        const giveStxBodySchema = z.object({
            guildId: z.string().min(1),
            channelId: z.string().min(1),
            memberId: z.string().min(1),
            amount: z.number().min(1),
            reason: z.string().min(1).optional(),
            expiresAt: z.enum(["1m", "2m", "3m", "4m", "5m", "10m", "15m", "20m", "30m", "45m", "60m", "1h", "2h", "4h", "6h", "8h", "12h", "24h"])
        });

        try {
            const { guildId, channelId, memberId, amount, reason, expiresAt } = giveStxBodySchema.parse(req.body);

            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                reply.code(StatusCodes.NOT_FOUND);
                return { message: "Guild not found", success: false };
            }

            const channel = await guild.channels.fetch(channelId);
            if (!channel) {
                reply.code(StatusCodes.NOT_FOUND);
                return { message: "Channel not found", success: false };
            }

            const member = await guild.members.fetch(memberId);
            if (!member || member.user.bot) {
                reply.code(StatusCodes.NOT_FOUND);
                return { message: "Member not found", success: false };
            }

            const application = req.application;
            if (!application) {
                reply.code(StatusCodes.INTERNAL_SERVER_ERROR);
                return { message: "Internal server error", success: false };
            }

            const botMember = await guild.members.fetch(application.data.id);
            if (!botMember) {
                reply.code(StatusCodes.FORBIDDEN);
                return { message: "You are not on this server", success: false };
            }
            if (!botMember.permissionsIn(channel).has("SendMessages")) {
                reply.code(StatusCodes.FORBIDDEN);
                return { message: "You do not have permission to send messages in this channel", success: false };
            }

            const existingTx = await redis.get(`tx:${application.data.id}:${memberId}`);
            if (existingTx) {
                reply.code(StatusCodes.CONFLICT);
                return { message: "You already have a transaction with this user in progress", success: false };
            }

            const appMoney = application.data.money.toNumber();
            if (appMoney < amount) {
                reply.code(StatusCodes.BAD_REQUEST);
                return { message: "Not enough money", success: false };
            }

            await prisma.$transaction([
                prisma.user.upsert({
                    where: { id: req.application.data.id },
                    update: {},
                    create: { id: req.application.data.id }
                }),
                prisma.user.upsert({
                    where: { id: memberId },
                    update: {},
                    create: { id: memberId }
                })
            ])
            const [_, transaction] = await Promise.all([
                redis.setex(`tx:${application.data.id}:${memberId}`, Math.min(convertTime({ time: expiresAt, to: "seconds" }), 60 * 30), JSON.stringify({ expiresAt: Date.now() + 1000 * 61, confirm: null, amount })),
                prisma.transaction.create({
                    data: {
                        amount,
                        channelId,
                        guildId,
                        reason,
                        status: "PENDING",
                        type: "API",
                        userId: application.data.id,
                        targetId: memberId,
                        expiresAt: calculateDate({ time: expiresAt, typeCalc: "increment" })
                    }
                })
            ])

            const row = createRow(
                new ButtonBuilder({
                    customId: `api/give-money/true/${transaction.id}`,
                    label: "Confirmar",
                    style: ButtonStyle.Success,
                }),
                new ButtonBuilder({
                    customId: `api/give-money/false/${transaction.id}`,
                    label: "Cancelar",
                    style: ButtonStyle.Danger,
                })
            );

            if (channel.isSendable()) {
                const msg = await channel.send(res.warning(brBuilder(
                    `A aplicação: ${userMention(application.data.id)} está enviando **${amount}** stx para você!`,
                    "",
                    `Com o motivo: **\`${reason ?? "Nenhum motivo fornecido"}\`**`,
                    `-# Você tem ${time(calculateDate({ time: expiresAt, typeCalc: "increment" }), "R")} para confirmar ou cancelar.`
                ), {
                    components: [row],
                    content: userMention(memberId),
                    thumbnail: { url: member.displayAvatarURL() }
                }))

                const newTransaction = await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        messageId: msg.id
                    }
                });

                if (newTransaction.expiresAt! < calculateDate({ time: "5m", typeCalc: "increment" })) {
                    scheduleTransactionExpires(client);
                }

                return reply.status(StatusCodes.CREATED).send({
                    transactionId: transaction.id,
                    botBalance: appMoney,
                    success: true,
                    message: "Transaction created",
                    data: newTransaction
                })
            } else {
                return reply.status(StatusCodes.BAD_REQUEST).send({ message: "Channel is not sendable" });
            }
        } catch (err: any) {
            reply.code(StatusCodes.INTERNAL_SERVER_ERROR);
            return { message: `Internal server error: ${err.message}`, success: false };
        }
    });

    createResponder({
        customId: "api/give-money/:confirm/:transactionId",
        types: [ResponderType.Button],
        cache: "cached",
        parse(params) {
            return {
                confirm: params.confirm === "true",
                transactionId: parseInt(params.transactionId),
            }
        },
        async run(interaction, { confirm, transactionId }): Promise<any> {
            await interaction.deferUpdate();

            const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });

            if (!transaction) {
                return interaction.update(res.danger(`${icon.error} | Transação expirada ou não encontrada ${icon.Eris_cry_left}`, { components: [] }));
            }

            if (transaction.targetId !== interaction.user.id) {
                console.log('Interação rejeitada: usuário não autorizado');
                return interaction.reply(res.danger(`${icon.error} | Ei, essa transação não é sua! ${icon.Eris_Angry_left}`));
            }

            if (transaction.status !== "PENDING") {
                return interaction.update(res.danger(`${icon.error} | Você já finalizou essa transação!`, { components: [] }));
            }

            const transactionKey = `tx:${transaction.userId}:${transaction.targetId}`;

            await interaction.editReply(res.primary(`${icon.info} | Processando... ${icon.Eris_thinking_left}`, { components: [] }));
            const application = await prisma.application.findUnique({ where: { id: transaction.userId } });
            if (!application) {
                await redis.del(transactionKey);
                return interaction.editReply(res.danger(`${icon.error} | Aplicação não encontrada`, { components: [] }));
            }

            if (application.money.toNumber() < transaction.amount) {
                await redis.del(transactionKey);
                return interaction.editReply(res.danger(`${icon.error} | A aplicação não tem dinheiro suficiente!`, { components: [] }));
            }

            if (confirm) {
                const endIn = transaction.expiresAt!;
                if (endIn < new Date(Date.now() + 1000)) {
                    await redis.del(transactionKey);
                    return interaction.editReply(res.danger(`${icon.error} | Transação expirada, você demorou demais para responder`, { components: [] }));
                }

                await prisma.$transaction([
                    prisma.application.update({
                        where: { id: transaction.userId },
                        data: { money: { decrement: transaction.amount } },
                    }),
                    prisma.user.update({
                        where: { id: transaction.targetId },
                        data: { money: { increment: transaction.amount } },
                    }),
                    prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: "APPROVED" }
                    }),
                    prisma.log.create({
                        data: {
                            message: `Recebeu dinheiro da aplicação: ${userMention(application.id)} com o motivo: ${transaction.reason ?? "Nenhum motivo fornecido"}`,
                            level: 7,
                            type: "info",
                            userId: transaction.targetId,
                            tags: ["economy", "transfer", "receive", "api", "transaction"]
                        }
                    })
                ]);

                await redis.del(transactionKey);
                return interaction.editReply(res.success(`${icon.Eris_happy} | Transação confirmada`, { components: [] }));
            } else {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "REJECTED" }
                });
                await redis.del(transactionKey);
                return interaction.editReply(res.danger(`${icon.error} | Transação cancelada`, { components: [] }));
            }
        },
    });
}