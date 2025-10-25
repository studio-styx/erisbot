import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { getRandomValue, icon, registerLog, res } from "#functions";
import { getLang, translate } from "#locale";
import { Prisma } from "#prisma";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

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
        const { user, locale } = interaction;

        const lang = getLang(locale);
        const t = translate.responders.transferResponder[lang];

        if (user.id !== authorId && user.id !== targetId) {
            const tries = trys.get(user.id);
            if (tries) {
                const messages = t.manyAttempts(tries);
                if (messages.length === 0) return;

                interaction.reply(res.danger(`${icon.denied} | ${getRandomValue(messages)}`));
                trys.set(user.id, tries + 1, { time: 1000 * 2 });
                return;
            }
            const messages: string[] = t.firstAttempt;
            interaction.reply(res.danger(`${icon.denied} |  ${getRandomValue(messages)}`));
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
            await interaction.editReply(res.warning(t.processing));

            const transaction = await prisma.transaction.findUniqueOrThrow({
                where: { id: transactionId },
            });

            try {
                // Primeiro, executa a transação para atualizar os saldos
                await prisma.$transaction<{
                    newAuthor: UserWithMoney;
                    newTarget: UserWithMoney;
                }>(async (tx) => {
                    const author = await tx.user.findUniqueOrThrow({
                        where: { id: authorId },
                        select: { money: true }
                    });

                    if (author.money.toNumber() < transaction.amount) {
                        await interaction.followUp(
                            res.danger(t.insufficientFunds.followUpMessage)
                        );
                        throw new Error(t.insufficientFunds.throwMessage);
                    }

                    if (transaction.status !== "PENDING") {
                        if (transaction.status === "EXPIRED") {
                            await interaction.followUp(
                                res.danger(t.expired.followUpMessage)
                            )
                            throw new Error(t.expired.throwMessage);
                        }
                        await interaction.followUp(
                            res.danger(t.alreadyConcluded.followUpMessage)
                        );
                        throw new Error(t.alreadyConcluded.throwMessage);
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
                        message: t.log.author(transaction, targetId),
                        level: 6,
                        type: "info",
                        user: authorId,
                        tags: ["transfer", "transaction", "economy", "sub"]
                    }),
                    registerLog({
                        message: t.log.targetId(transaction, authorId),
                        level: 6,
                        type: "info",
                        user: targetId,
                        tags: ["transfer", "transaction", "economy", "sum"]
                    })
                ]);

                await interaction.editReply(res.success(t.success(transaction), { components: [] }));
            } catch (error: any) {
                await interaction.followUp(
                    res.danger(t.errorMessage(error.message))
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
                label: t.buttonConfirm(acceptedCount),
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