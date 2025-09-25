import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { calculateHandValue, deleteBlackjackGameMultiplayer, drawCard, getBlackjackGameMultiplayer, icon, res, resv2, setBlackjackGameMultiplayer } from "#functions";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, userMention } from "discord.js";

createResponder({
    customId: "blackjackMultiplayer/game/:action/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { action, userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Apenas ${userMention(userId)} pode usar esse botão.`));
            return;
        }

        const game = getBlackjackGameMultiplayer(interaction.message.id);
        if (!game) {
            interaction.update(resv2.danger(`${icon.denied} | Essa partida não existe mais.`));
            return;
        }

        switch (action) {
            case "hit": {
                const drawCardResult = drawCard(game.remaningCards);
                game.remaningCards = drawCardResult.remaningCards;
                game[game.turn === "user" ? "userHand" : "targetHand"].push(drawCardResult.card);
                const handValue = calculateHandValue(game[game.turn === "user" ? "userHand" : "targetHand"]);
                game.rounds++;
                game.passCount = 0;

                if (handValue > 21) {
                    deleteBlackjackGameMultiplayer(interaction.message.id);
                    await interaction.deferUpdate();
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: game.turn === "user" ? game.userId : game.targetId },
                            data: {
                                money: {
                                    increment: game.amount
                                }
                            }
                        }),
                        prisma.user.update({
                            where: { id: game.turn === "user" ? game.targetId : game.userId },
                            data: {
                                money: {
                                    decrement: game.amount
                                }
                            }
                        })
                    ])
                    interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.denied} | ${userMention(game.turn === "user" ? game.userId : game.targetId)} estourou! ${userMention(game.turn === "user" ? game.targetId : game.userId)} venceu a partida com **${calculateHandValue(game[game.turn === "user" ? "targetHand" : "userHand"])}** pontos e ganhou **${game.amount}** stx patrocinado por ${userMention(game.turn === "user" ? game.userId : game.targetId)}!`));
                    return;
                }

                game.turn = game.turn === "user" ? "target" : "user";
                try {
                    await game.userInteraction.followUp(res.fuchsia(`${icon.success} | Suas cartas: ${game.userHand.map(c => `\`${c.name}\``).join(", ")}, valor da sua mão: **${calculateHandValue(game.userHand)}**`));
                    await game.targetInteraction.followUp(res.fuchsia(`${icon.success} | Suas cartas: ${game.targetHand.map(c => `\`${c.name}\``).join(", ")}, valor da sua mão: **${calculateHandValue(game.targetHand)}**`));
                } catch (_e) {
                    game[game.turn === "user" ? "userInteraction" : "targetInteraction"] = interaction;
                }
                setBlackjackGameMultiplayer(interaction.message.id, game);
                interaction.update(menus.cassino.blackjackMultiplayer(game));
                return;
            }
            case "pass": {
                game.passCount++;
                if (game.passCount >= 3) {
                    deleteBlackjackGameMultiplayer(interaction.message.id);
                    const userHandValue = calculateHandValue(game.userHand);
                    const targetHandValue = calculateHandValue(game.targetHand);

                    await interaction.deferUpdate();
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: game.userId },
                            data: {
                                money: userHandValue > targetHandValue ? {
                                    increment: game.amount
                                } : targetHandValue > userHandValue ? {
                                    decrement: game.amount
                                } : undefined
                            }
                        }),
                        prisma.user.update({
                            where: { id: game.targetId },
                            data: {
                                money: targetHandValue > userHandValue ? {
                                    increment: game.amount
                                } : userHandValue > targetHandValue ? {
                                    decrement: game.amount
                                } : undefined
                            }
                        })
                    ])

                    if (userHandValue > targetHandValue) {
                        interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.success} | Ambos os jogadores passaram a vez, ${userMention(game.userId)} venceu a partida com **${userHandValue}** contra **${targetHandValue}** de ${userMention(game.targetId)}! e ganhou **${game.amount}** stx patrocinado por ${userMention(game.targetId)}!`));
                    } else if (targetHandValue > userHandValue) {
                        interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.success} | Ambos os jogadores passaram a vez, ${userMention(game.targetId)} venceu a partida com **${targetHandValue}** contra **${userHandValue}** de ${userMention(game.userId)}! e ganhou **${game.amount}** stx patrocinado por ${userMention(game.userId)}!`));
                    } else {
                        interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.warning} | Ambos os jogadores passaram a vez e empataram com **${userHandValue}** pontos! Ambos jogadores recuperam suas apostas!`));
                    }
                    return;
                }
                game.turn = game.turn === "user" ? "target" : "user";
                setBlackjackGameMultiplayer(interaction.message.id, game);
                interaction.update(menus.cassino.blackjackMultiplayer(game));
                return;
            }
            case "stand": {
                interaction.update(resv2.warning(
                    `${icon.warning} | ${userMention(game.turn === "user" ? game.targetId : game.userId)} O seu adversário quer parar o jogo, você deseja continuar ou parar também?`,
                    createRow(
                        new ButtonBuilder({
                            customId: `blackjackMultiplayer/game/standFailed/${game.turn === "user" ? game.targetId : game.userId}`,
                            label: "Continuar",
                            style: ButtonStyle.Success,
                        }),
                        new ButtonBuilder({
                            customId: `blackjackMultiplayer/game/standSuccess/${game.turn === "user" ? game.targetId : game.userId}`,
                            label: "Parar",
                            style: ButtonStyle.Danger,
                        })
                    )
                ));
                return;
            }
            case "standFailed": {
                game.turn = game.turn === "user" ? "target" : "user";
                try {
                    await game.userInteraction.followUp(res.fuchsia(`${icon.success} | Suas cartas: ${game.userHand.map(c => `\`${c.name}\``).join(", ")}, valor da sua mão: **${calculateHandValue(game.userHand)}**`));
                    await game.targetInteraction.followUp(res.fuchsia(`${icon.success} | Suas cartas: ${game.targetHand.map(c => `\`${c.name}\``).join(", ")}, valor da sua mão: **${calculateHandValue(game.targetHand)}**`));
                } catch (_e) {
                    game[game.turn === "user" ? "userInteraction" : "targetInteraction"] = interaction;
                }
                setBlackjackGameMultiplayer(interaction.message.id, game);
                await interaction.update(menus.cassino.blackjackMultiplayer(game));
                await interaction.followUp(res.fuchsia(`${icon.success} | ${userMention(interaction.user.id)} decidiu continuar a partida!`, { flags: [] }));
                return;
            }
            case "standSuccess": {
                deleteBlackjackGameMultiplayer(interaction.message.id);
                const userHandValue = calculateHandValue(game.userHand);
                const targetHandValue = calculateHandValue(game.targetHand);

                await interaction.deferUpdate();

                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: game.userId },
                        data: {
                            money: userHandValue > targetHandValue ? {
                                increment: game.amount
                            } : targetHandValue > userHandValue ? {
                                decrement: game.amount
                            } : undefined
                        }
                    }),
                    prisma.user.update({
                        where: { id: game.targetId },
                        data: {
                            money: targetHandValue > userHandValue ? {
                                increment: game.amount
                            } : userHandValue > targetHandValue ? {
                                decrement: game.amount
                            } : undefined
                        }
                    })
                ])

                if (userHandValue > targetHandValue) {
                    interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.success} | ${userMention(interaction.user.id)} decidiu parar a partida! ${userMention(game.userId)} venceu a partida com **${userHandValue}** contra **${targetHandValue}** de ${userMention(game.targetId)}! e ganhou **${game.amount}** stx patrocinado por ${userMention(game.targetId)}!`));
                } else if (targetHandValue > userHandValue) {
                    interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.success} | ${userMention(interaction.user.id)} decidiu parar a partida! ${userMention(game.targetId)} venceu a partida com **${targetHandValue}** contra **${userHandValue}** de ${userMention(game.userId)}! e ganhou **${game.amount}** stx patrocinado por ${userMention(game.userId)}!`));
                } else {
                    interaction.editReply(menus.cassino.blackjackMultiplayer(game, `${icon.warning} | ${userMention(interaction.user.id)} decidiu parar a partida! Ambos os jogadores empataram com **${userHandValue}** pontos! Ambos jogadores recuperam suas apostas!`));
                }
                return;
            }
        }
    },
});
