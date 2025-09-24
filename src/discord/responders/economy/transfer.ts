import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { icon, registerLog, res } from "#functions";
import { Prisma } from "#prisma";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, userMention } from "discord.js";

const trys = new Store<number>()

createResponder({
    customId: "transfer/:authorId/:authorAccepted/:targetId/:targetAccepted/:transactionId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            authorId: params.authorId,
            authorAccepted: params.authorAccepted === "1",
            targetId: params.targetId,
            targetAccepted: params.targetAccepted === "1",
            transactionId: Number(params.transactionId)
        }
    },
    async run(interaction, { authorId, authorAccepted, targetId, targetAccepted, transactionId }) {
        const { user } = interaction;

        if (user.id !== authorId && user.id !== targetId) {
            const tries = trys.get(user.id);
            if (tries) {
                const messages: string[] = []
                if (tries === 1) {
                    messages.push(
                        `${icon.denied} | Eu já te disse que essa transação não é sua!`,
                        `${icon.denied} | Ei por quê você ainda tá tentando roubar dinheiro dos outros? isso não é legal! ${icon.Eris_Angry_left}`,
                        `${icon.denied} | Ei! tem usuários querendo paz aqui!`
                    )
                } else if (tries === 2) {
                    messages.push(
                        `${icon.Eris_Angry} | Ei volte pra onde veio seu ladrãozinho!`,
                        `${icon.Eris_Angry} | Essa já é sua terceira tentativa tentando roubar dinheiro dos outros, já te disse que isso não é possivel!`,
                        `${icon.Eris_Angry} | Você não conseguirá furar essa transação!`
                    )
                } else if (tries === 3) {
                    messages.push(
                        `${icon.Eris_Angry} | Eu não irei repetir! volte pra onde veio!`,
                        `${icon.Eris_Angry} | Eu vou começar a te ignorar!`,
                        `${icon.Eris_Angry} | Pode ficar ai tentando roubar, você não terá mais respostas.`,
                    )
                } else {
                    trys.set(user.id, tries + 1, { time: 1000 * 2 });
                    return;
                }

                interaction.reply(res.danger(`${icon.denied} | ${messages[Math.floor(Math.random() * messages.length)]}`));
                trys.set(user.id, tries + 1, { time: 1000 * 2 });
                return;
            }
            const messages: string[] = [
                "Você não pode usar este botão!",
                "Você está tentando pegar dinheiro dos outros? não tente mais isso!",
                `Essa transação não é para você! ${icon.Eris_Angry_left}`,
            ]
            interaction.reply(res.danger(`${icon.denied} | ${messages[Math.floor(Math.random() * messages.length)]}`));
            trys.set(user.id, 1, { time: 1000 * 2 });
            return;
        }

        // Corrigindo a lógica de toggle
        let newAuthorAccepted = authorAccepted;
        let newTargetAccepted = targetAccepted;

        if (user.id === authorId) {
            newAuthorAccepted = !authorAccepted;
        }
        if (user.id === targetId) {
            newTargetAccepted = !targetAccepted;
        }

        // Se ambos aceitaram, processa a transação
        if (newAuthorAccepted && newTargetAccepted) {
            await interaction.deferUpdate();
            await interaction.editReply(res.warning(`${icon.waiting_white} | Processando a transação...`));

            const transaction = await prisma.transaction.findUniqueOrThrow({
                where: { id: transactionId },
            });

            try {
                // Primeiro, executa a transação para atualizar os saldos
                const { newAuthor, newTarget } = await prisma.$transaction<{
                    newAuthor: UserWithMoney;
                    newTarget: UserWithMoney;
                }>(async (tx) => {
                    const author = await tx.user.findUniqueOrThrow({
                        where: { id: authorId },
                        select: { money: true }
                    });

                    if (author.money.toNumber() < transaction.amount) {
                        await interaction.followUp(
                            res.danger(`${icon.denied} | Saldo insuficiente!`)
                        );
                        throw new Error('Saldo insuficiente');
                    }

                    if (transaction.status !== "PENDING") {
                        if (transaction.status === "EXPIRED") {
                            await interaction.followUp(
                                res.danger(`${icon.Eris_cry} | Você demorou demais para aceitar essa transação, por isso ela foi fechada!`)
                            )
                            throw new Error('Essa transação foi expirada!');
                        }
                        await interaction.followUp(
                            res.danger(`${icon.denied} | Essa transação já foi concluída!`)
                        );
                        throw new Error('Essa transação já foi concluída');
                    }

                    const [updatedAuthor, updatedTarget] = await Promise.all([
                        tx.user.update({
                            where: { id: authorId },
                            data: { money: { decrement: transaction.amount } },
                            select: { money: true }
                        }),
                        tx.user.upsert({
                            where: { id: targetId },
                            create: {
                                id: targetId,
                                money: transaction.amount + 50,
                            },
                            update: {
                                money: { increment: transaction.amount },
                            },
                            select: { money: true }
                        }),
                        tx.transaction.update({
                            where: { id: transactionId },
                            data: { status: "APPROVED" },
                        })
                    ]);

                    return { newAuthor: updatedAuthor, newTarget: updatedTarget };
                });

                await Promise.all([
                    registerLog({
                        message: `Deu **${transaction.amount} stx** para: ${userMention(targetId)}`,
                        level: 6,
                        type: "info",
                        user: authorId,
                        tags: ["transfer", "transaction", "economy", "sub"]
                    }),
                    registerLog({
                        message: `Recebeu **${transaction.amount} stx** de: ${userMention(authorId)}`,
                        level: 6,
                        type: "info",
                        user: targetId,
                        tags: ["transfer", "transaction", "economy", "sum"]
                    })
                ]);

                const targetUser = interaction.client.users.cache.get(targetId);
                const authorUser = interaction.user.id === authorId ? interaction.user : interaction.client.users.cache.get(authorId);

                const embed = createEmbed({
                    title: `${icon.Eris_happy} Transferência concluída`,
                    description: `${userMention(authorId)} Enviou **${transaction.amount}** stx para ${userMention(targetId)}!`,
                    fields: [
                        {
                            name: `Saldo de ${authorUser?.displayName}`,
                            value: newAuthor.money.toString(),
                            inline: true
                        },
                        {
                            name: `Saldo de ${targetUser?.displayName}`,
                            value: newTarget.money.toString(),
                            inline: true
                        }
                    ],
                    color: settings.colors.success
                });

                await interaction.editReply({ embeds: [embed], components: [] });
            } catch (error: any) {
                await interaction.followUp(
                    res.danger(`${icon.denied} | Erro na transferência: ${error.message}`)
                );
            }
            return;
        }

        // Atualiza o botão com os novos valores
        const newCustomId = `transfer/${authorId}/${newAuthorAccepted ? "1" : "0"}/${targetId}/${newTargetAccepted ? "1" : "0"}/${transactionId}`;
        const acceptedCount = (newAuthorAccepted ? 1 : 0) + (newTargetAccepted ? 1 : 0);

        const row = createRow(
            new ButtonBuilder({
                customId: newCustomId,
                label: `Confirmar ( ${acceptedCount}/2 )`,
                style: ButtonStyle.Success,
                disabled: (newAuthorAccepted && newTargetAccepted),
                emoji: icon.paid
            })
        )

        await interaction.update({ components: [row] });
        return;
    },
});

interface UserWithMoney {
    money: Prisma.Decimal;
}