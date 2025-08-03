import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { icon, registerLog, res } from "#functions";
import { brBuilder, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, Client, userMention } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

const takeMoneyCooldown = new Store<{
    expiresAt: Date;
    confirm: boolean;
} | {
    expiresAt: Date;
    confirm: null;
    amount: number;
}>();

export async function economyRoute(app: FastifyInstance, client: Client<true>) {
    app.post("/economy/give-stx", async (req, reply) => {
        const giveStxBodySchema = z.object({
            guildId: z.string().min(1),
            channelId: z.string().min(1),
            memberId: z.string().min(1),
            amount: z.number().min(1),
            reason: z.string().min(1).optional()
        })

        const { guildId, channelId, memberId, amount, reason } = giveStxBodySchema.parse(req.body);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Guild not found" });
        const channel = await guild.channels.fetch(channelId);
        if (!channel) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Channel not found" });
        const member = await guild.members.fetch(memberId);
        if (!member || member.user.bot) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Member not found" });

        const application = req.application;

        if (!application) return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });

        const appMoney = application.data.money.toNumber();

        if (appMoney < amount) return reply.status(StatusCodes.BAD_REQUEST).send({ message: "Not enough money" });

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

        return reply.status(StatusCodes.OK).send({ message: "Success" });
    });
    app.post("/economy/take-stx", async (req, reply) => {
        const takeStxBodySchema = z.object({
            guildId: z.string().min(1),
            channelId: z.string().min(1),
            memberId: z.string().min(1),
            amount: z.number().min(1),
            reason: z.string().min(1).optional()
        })

        const { guildId, channelId, memberId, amount, reason } = takeStxBodySchema.parse(req.body);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Guild not found" });
        const channel = await guild.channels.fetch(channelId);
        if (!channel) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Channel not found" });
        const member = await guild.members.fetch(memberId);
        if (!member || member.user.bot) return reply.status(StatusCodes.NOT_FOUND).send({ message: "Member not found" });

        const application = req.application;

        if (!application) return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });

        if (takeMoneyCooldown.get(`${memberId}:${application.data.id}`)) return reply.status(StatusCodes.CONFLICT).send({ message: "You already have a transaction with this user in progress" })

        const user = await prisma.user.findUnique({
            where: { id: memberId }
        });

        if (!user || user.money.toNumber() < amount) return reply.status(StatusCodes.BAD_REQUEST).send({ message: "Not enough money" })

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
        )

        if (channel.isSendable()) {
            const msg = await channel.send(res.warning(brBuilder(
                `A aplicação: ${userMention(application.data.id)} está requisitando **${amount}** stx de você!`,
                "",
                `Com o motivo: **\`${reason ?? "Nenhum motivo fornecido"}\`**`,
                "-# Você tem 30 segundos para confirmar ou cancelar."
            ), {
                components: [makeRow()],
                content: userMention(memberId),
                thumbnail: { url: member.displayAvatarURL() }
            }))
            takeMoneyCooldown.set(`${memberId}:${application.data.id}`, { expiresAt: new Date(Date.now() + 1000 * 32), confirm: null, amount }, {
                time: 1000 * 60 * 2
            });

            function waitForConfirmation(key: string, timeout = 32_000): Promise<"confirmed" | "canceled" | "expired"> {
                return new Promise((resolve) => {
                    const interval = setInterval(() => {
                        const data = takeMoneyCooldown.get(key);
                        if (data?.confirm === true) {
                            clearInterval(interval);
                            resolve("confirmed");
                        } else if (data?.confirm === false) {
                            clearInterval(interval);
                            resolve("canceled");
                        } else if (data && Date.now() > data.expiresAt.getTime()) {
                            clearInterval(interval);
                            resolve("expired");
                        }
                    }, 1000);
                    setTimeout(() => {
                        clearInterval(interval);
                        resolve("expired");
                    }, timeout);
                });
            }

            const result = await waitForConfirmation(`${memberId}:${application.data.id}`);
            switch (result) {
                case "confirmed":
                    takeMoneyCooldown.delete(`${memberId}:${application.data.id}`);
                    await registerLog({
                        message: `Transação confirmada com a aplicação: ${userMention(application.data.id)}`,
                        level: 7,
                        type: "info",
                        user: memberId,
                        tags: ["economy", "transfer", "sum", "api", "transaction"]
                    })
                    return reply.status(StatusCodes.OK).send({ message: `Success to take ${amount} from ${member.displayName}` });
                case "canceled":
                    takeMoneyCooldown.delete(`${memberId}:${application.data.id}`);
                    await
                        registerLog({
                            message: `Transação cancelada com a aplicação: ${userMention(application.data.id)}`,
                            level: 7,
                            type: "info",
                            user: memberId,
                            tags: ["economy", "transfer", "cancel", "api", "transaction"]
                        })
                    return reply.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).send({ message: `User canceled the transaction` });
                case "expired":
                    msg.edit(res.danger(`${icon.error} | Transação expirada, você demorou demais para responder`, { components: [makeRow(true)] }))
                    takeMoneyCooldown.delete(`$${memberId}:${application.data.id}`);
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
    });
    app.get("/economy/balance/:userId", async (req, reply) => {
        const { userId } = z.object({
            userId: z.string().min(1)
        }).parse(req.params);

        const discordUser = await client.users.fetch(userId, { cache: true }).catch(() => null);

        if (!discordUser) {
            return reply.status(StatusCodes.NOT_FOUND).send({ message: "User not found" });
        }

        const user = await prisma.user.upsert({
            where: { id: userId },
            update: { id: userId },
            create: { id: userId }
        });

        return reply.status(StatusCodes.OK).send({ money: user.money.toNumber(), bank: user.bank.toNumber() });
    });
    app.post("/economy/transactions/:userId", async (req, reply) => {
        const { userId } = z.object({
            userId: z.string().min(1)
        }).parse(req.params);

        const transactionsLogsBodySchema = z.object({
            limit: z.number().min(1).max(30).optional(),
            timeLimit: z.date().optional()
        });

        const body = req.body ? transactionsLogsBodySchema.parse(req.body) : {};

        const logs = await prisma.log.findMany({
            where: {
                userId,
                type: "info",
                timestamp: {
                    gte: body.timeLimit ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
                },
                tags: {
                    has: "transaction"
                }
            },
            orderBy: {
                timestamp: "desc"
            },
            take: body.limit ?? 40
        });

        return reply.status(StatusCodes.OK).send({ data: logs });

    })
}

createResponder({
    customId: "api/take-money/:confirm/:appId/:targetId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { appId, targetId, confirm }) {
        if (targetId !== interaction.user.id) {
            interaction.reply(res.danger(`${icon.error} | Ei essa transação não é sua! ${icon.Eris_Angry_left}`));
            return;
        }

        const transactionData = takeMoneyCooldown.get(`${targetId}:${appId}`);

        if (!transactionData) {
            interaction.update(res.danger(`${icon.error} | Meu cachorro comeu essa transação ${icon.Eris_cry_left}`, { components: [] }));
            return;
        }

        if (transactionData.confirm !== null) {
            interaction.update(res.danger(`${icon.error} | Você já finalizou essa transação!`, { components: [] }));
            return;
        }

        await interaction.deferUpdate();
        await interaction.editReply(res.primary(`${icon.info} | Processando... ${icon.Eris_thinking_left}`, { components: [] }))

        const application = await prisma.application.findUnique({
            where: { id: appId }
        });

        if (!application) {
            interaction.editReply(res.danger(`${icon.error} | Aplicação não encontrada`, { components: [] }));
            takeMoneyCooldown.set(`${targetId}:${appId}`, {
                confirm: false,
                expiresAt: transactionData.expiresAt
            }, { time: 1000 * 60 * 2 })
            return;
        };

        const user = await prisma.user.findUnique({
            where: { id: targetId }
        });

        if (!user || user.money.toNumber() < transactionData.amount) {
            interaction.editReply(res.danger(`${icon.error} | O usuário não tem dinheiro suficiente!`));
            takeMoneyCooldown.set(`${targetId}:${appId}`, {
                confirm: false,
                expiresAt: transactionData.expiresAt
            }, { time: 1000 * 60 * 2 })
            return;
        };


        if (confirm === "true") {
            const endIn = takeMoneyCooldown.get(`${targetId}:${appId}`)?.expiresAt.getTime();

            // evitar usar o botão em cima da hora
            if (!endIn || Date.now() > (endIn - 1000)) {
                interaction.editReply(res.danger(`${icon.error} | Transação expirada, você demorou demais para responder`, { components: [] }));
                return;
            }

            await prisma.$transaction([
                prisma.application.update({
                    where: { id: appId },
                    data: { money: { increment: transactionData.amount } }
                }),
                prisma.user.update({
                    where: { id: targetId },
                    data: { money: { decrement: transactionData.amount } }
                })
            ]);
            takeMoneyCooldown.set(`${targetId}:${appId}`, {
                confirm: true,
                expiresAt: transactionData.expiresAt
            }, { time: 1000 * 60 * 2 })

            interaction.editReply(res.success(`${icon.Eris_happy} | Transação confirmada`, { components: [] }));
            return;
        } else {
            takeMoneyCooldown.set(`${targetId}:${appId}`, {
                confirm: false,
                expiresAt: transactionData.expiresAt
            }, { time: 1000 * 60 * 2 });

            interaction.editReply(res.danger(`${icon.error} | Transação cancelada`, { components: [] }));
            return;
        }
    },
});