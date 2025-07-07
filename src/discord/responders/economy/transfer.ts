import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { Prisma } from "#prisma";
import { settings } from "#settings";
import { icon, res } from "#utils";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, userMention } from "discord.js";

createResponder({
    customId: "transfer/:authorId/:authorAccepted/:targetId/:targetAccepted/:value",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { authorId, authorAccepted, targetId, targetAccepted, value }) {
        const { user } = interaction;

        if (user.id !== authorId && user.id !== targetId) {
            interaction.reply(res.danger(`${icon.denied} | Você não pode usar este botão!`));
            return;
        }
        
        let targetAcceptedBoolean = targetAccepted === "1";
        let authorAcceptedBoolean = authorAccepted === "1";

        if (user.id === authorId && authorAcceptedBoolean) {
            interaction.reply(res.danger(`${icon.denied} | Você já aceitou a transferência! aguarde o recebedor aceitar!`));
            return;
        }

        if (user.id === targetId && targetAcceptedBoolean) {
            interaction.reply(res.danger(`${icon.denied} | Você já aceitou a transferência! aguarde o pagador aceitar!`));
            return;
        }

        if (user.id === authorId) authorAcceptedBoolean = true;
        if (user.id === targetId) targetAcceptedBoolean = true;

        interface UserWithMoney {
            money: Prisma.Decimal;
        }

        if (authorAcceptedBoolean && targetAcceptedBoolean) {
            await interaction.deferUpdate();

            try {
                const { newAuthor, newTarget } = await prisma.$transaction<{
                    newAuthor: UserWithMoney;
                    newTarget: UserWithMoney;
                }>(async (tx) => {
                    const author = await tx.user.findUniqueOrThrow({
                        where: { id: authorId },
                        select: { money: true }
                    });

                    if (author.money.toNumber() < Number(value)) {
                        await interaction.followUp(
                            res.danger(`${icon.denied} | Saldo insuficiente!`)
                        );
                        throw new Error('Saldo insuficiente');
                    }

                    const [updatedAuthor, updatedTarget] = await Promise.all([
                        tx.user.update({
                            where: { id: authorId },
                            data: { money: { decrement: Number(value) } },
                            select: { money: true }
                        }),
                        tx.user.upsert({
                            where: { id: targetId },
                            create: {
                                id: targetId,
                                money: Number(value) + 50,
                            },
                            update: {
                                money: { increment: Number(value) },
                            },
                            select: { money: true }
                        })
                    ]);
                
                    return { newAuthor: updatedAuthor, newTarget: updatedTarget };
                });

                const targetUser = interaction.client.users.cache.get(targetId);
                const authorUser = interaction.user.id === authorId ? interaction.user : interaction.client.users.cache.get(authorId);
                
                const embed = createEmbed({
                    title: `${icon.money} Transferência concluída`,
                    description: `${userMention(authorId)} Enviou **${value}** stx para ${userMention(targetId)}!`,
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

        const newCustomId = `transfer/${authorId}/${authorAcceptedBoolean ? "1" : "0"}/${targetId}/${targetAcceptedBoolean ? "1" : "0"}/${value}`;

        const row = createRow(
            new ButtonBuilder({
                customId: newCustomId,
                label: "Confirmar ( 1/2 )",
                style: ButtonStyle.Success,
                disabled: (authorAcceptedBoolean && targetAcceptedBoolean),
                emoji: icon.paid
            })
        )

        await interaction.update({ components: [row] });
        return;
    },
});