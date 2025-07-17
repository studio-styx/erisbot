import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { Prisma } from "#prisma";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, userMention } from "discord.js";

const trys = new Store<number>()

createResponder({
    customId: "transfer/:authorId/:authorAccepted/:targetId/:targetAccepted/:value",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { authorId, authorAccepted, targetId, targetAccepted, value }) {
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