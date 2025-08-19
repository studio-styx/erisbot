import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { res, icon, registerLog } from "#functions";
import { createRow, brBuilder } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, Client, userMention } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { clearInterval } from "node:timers";

export default async function takeStx(app: FastifyInstance, client: Client<true>) {
    app.post("/take-stx", async (req, reply) => {
        const takeStxBodySchema = z.object({
            guildId: z.string().min(1),
            channelId: z.string().min(1),
            memberId: z.string().min(1),
            amount: z.number().min(1),
            reason: z.string().min(1).optional()
        });

        try {
            const { guildId, channelId, memberId, amount, reason } = takeStxBodySchema.parse(req.body);

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

            const existingTx = await redis.get(`tx:${memberId}:${application.data.id}`);
            if (existingTx) {
                reply.code(StatusCodes.CONFLICT);
                return { message: "You already have a transaction with this user in progress", success: false };
            }

            const user = await prisma.user.findUnique({ where: { id: memberId } });
            if (!user || user.money.toNumber() < amount) {
                reply.code(StatusCodes.BAD_REQUEST);
                return { message: "Not enough money", success: false };
            }

            const makeRow = (disabled = false) => createRow(
                new ButtonBuilder({
                    customId: `api/take-money/true/${application.data.id}/${memberId}`,
                    label: "Confirmar",
                    style: ButtonStyle.Success,
                    disabled
                }),
                new ButtonBuilder({
                    customId: `api/take-money/false/${application.data.id}/${memberId}`,
                    label: "Cancelar",
                    style: ButtonStyle.Danger,
                    disabled
                })
            );

            if (channel.isSendable()) {
                const msg = await channel.send(res.warning(brBuilder(
                    `A aplicação: ${userMention(application.data.id)} está requisitando **${amount}** stx de você!`,
                    "",
                    `Com o motivo: **\`${reason ?? "Nenhum motivo fornecido"}\`**`,
                    "-# Você tem 1 minuto para confirmar ou cancelar."
                ), {
                    components: [makeRow()],
                    content: userMention(memberId),
                    thumbnail: { url: member.displayAvatarURL() }
                }))
                await redis.setex(`tx:${memberId}:${application.data.id}`, 60, JSON.stringify({ expiresAt: Date.now() + 1000 * 61, confirm: null, amount }))

                function waitForConfirmation(key: string, timeout = 62_000): Promise<"confirmed" | "canceled" | "expired"> {
                    return new Promise(async (resolve) => {
                        const interval = setInterval(async () => {
                            const raw = await redis.get(key);
                            if (!raw) {
                                clearInterval(interval);
                                resolve("expired")
                            } else {
                                const data = JSON.parse(raw);
                                if (data?.confirm === true) {
                                    clearInterval(interval);
                                    resolve("confirmed");
                                } else if (data?.confirm === false) {
                                    clearInterval(interval);
                                    resolve("canceled");
                                } else if (data && Date.now() > data.expiresAt.getTime) {
                                    clearInterval(interval);
                                    resolve("expired");
                                }
                            }
                        }, 1000);
                        setTimeout(() => {
                            clearInterval(interval);
                            resolve("expired");
                        }, timeout);
                    });
                }

                const result = await waitForConfirmation(`tx:${memberId}:${application.data.id}`);
                switch (result) {
                    case "confirmed":
                        await redis.del(`tx:${memberId}:${application.data.id}`);
                        await registerLog({
                            message: `Transação confirmada com a aplicação: ${userMention(application.data.id)}`,
                            level: 7,
                            type: "info",
                            user: memberId,
                            tags: ["economy", "transfer", "sum", "api", "transaction"]
                        })
                        return reply.status(StatusCodes.OK).send({ message: `Success to take ${amount} from ${member.displayName}` });
                    case "canceled":
                        await redis.del(`tx:${memberId}:${application.data.id}`);
                        await
                            registerLog({
                                message: `Transação cancelada com a aplicação: ${userMention(application.data.id)}`,
                                level: 7,
                                type: "info",
                                user: memberId,
                                tags: ["economy", "transfer", "cancel", "api", "transaction"]
                            })
                        return reply.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ message: `User canceled the transaction` });
                    case "expired":
                        msg.edit(res.danger(`${icon.error} | Transação expirada, você demorou demais para responder`, { components: [makeRow(true)] }))
                        await redis.del(`tx:${memberId}:${application.data.id}`);
                        await registerLog({
                            message: `Transação expirada com a aplicação: ${userMention(application.data.id)}`,
                            level: 7,
                            type: "info",
                            user: memberId,
                            tags: ["economy", "transfer", "timeout", "api", "transaction"]
                        })
                        return reply.status(StatusCodes.REQUEST_TIMEOUT).send({ message: "User does not response" });
                }
            } else {
                return reply.status(StatusCodes.BAD_REQUEST).send({ message: "Channel is not sendable" });
            }
        } catch (err: any) {
            reply.code(StatusCodes.INTERNAL_SERVER_ERROR);
            return { message: `Internal server error: ${err.message}`, success: false };
        }
    });

    createResponder({
        customId: "api/take-money/:confirm/:appId/:targetId",
        types: [ResponderType.Button],
        cache: "cached",
        async run(interaction, { confirm, appId, targetId }): Promise<any> {
            if (targetId !== interaction.user.id) {
                console.log('Interação rejeitada: usuário não autorizado');
                return interaction.reply(res.danger(`${icon.error} | Ei, essa transação não é sua! ${icon.Eris_Angry_left}`));
            }

            const transactionKey = `tx:${targetId}:${appId}`;
            const transaction = await redis.get(transactionKey);
            if (!transaction) {
                return interaction.update(res.danger(`${icon.error} | Transação expirada ou não encontrada ${icon.Eris_cry_left}`, { components: [] }));
            }

            const transactionData = JSON.parse(transaction);
            if (transactionData.confirm !== null) {
                console.log(`Transação já finalizada (confirm: ${transactionData.confirm})`);
                return interaction.update(res.danger(`${icon.error} | Você já finalizou essa transação!`, { components: [] }));
            }

            await interaction.deferUpdate();
            await interaction.editReply(res.primary(`${icon.info} | Processando... ${icon.Eris_thinking_left}`, { components: [] }));

            const application = await prisma.application.findUnique({ where: { id: appId } });
            if (!application) {
                await redis.setex(transactionKey, 60, JSON.stringify({ ...transactionData, confirm: false }));
                return interaction.editReply(res.danger(`${icon.error} | Aplicação não encontrada`, { components: [] }));
            }

            const user = await prisma.user.findUnique({ where: { id: targetId } });
            if (!user || user.money.toNumber() < transactionData.amount) {
                await redis.setex(transactionKey, 60, JSON.stringify({ ...transactionData, confirm: false }));
                return interaction.editReply(res.danger(`${icon.error} | O usuário não tem dinheiro suficiente!`, { components: [] }));
            }

            if (confirm === "true") {
                const endIn = transactionData.expiresAt;
                if (!endIn || Date.now() > endIn - 1000) {
                    await redis.setex(transactionKey, 60, JSON.stringify({ ...transactionData, confirm: false }));
                    return interaction.editReply(res.danger(`${icon.error} | Transação expirada, você demorou demais para responder`, { components: [] }));
                }

                await prisma.$transaction([
                    prisma.application.update({
                        where: { id: appId },
                        data: { money: { increment: transactionData.amount } },
                    }),
                    prisma.user.update({
                        where: { id: targetId },
                        data: { money: { decrement: transactionData.amount } },
                    }),
                ]);

                await redis.setex(transactionKey, 60, JSON.stringify({ ...transactionData, confirm: true }));
                return interaction.editReply(res.success(`${icon.Eris_happy} | Transação confirmada`, { components: [] }));
            } else {
                await redis.setex(transactionKey, 60, JSON.stringify({ ...transactionData, confirm: false }));
                return interaction.editReply(res.danger(`${icon.error} | Transação cancelada`, { components: [] }));
            }
        },
    });
}