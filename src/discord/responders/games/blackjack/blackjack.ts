import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getBlackjackGame, icon, removeBlackjackGame, res, setBlackjackGame } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "blackjack/game/:action/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { userId, action }) {
        if (interaction.user.id !== userId) {
            await interaction.reply(res.danger(`${icon.denied} | Eu sei que é legal jogar uma partida mas esse jogo não é seu!`));
            return;
        }
        const game = getBlackjackGame(userId);

        if (!game) {
            await interaction.reply(res.danger(`${icon.denied} | A partida durou muito e foi apagada!`));
            return;
        }

        const multiplier = game.getErisDifficulty() <= 1 ? 1.5 : game.getErisDifficulty() * 1.5;
        await interaction.deferUpdate();

        const erisAction = async () => {
            const erisAction = game.decideErisAction(game.calculateHandValue(game.getUserCards()));

            if (erisAction) {
                const card = game.erisTurn();
                if (!card) {
                    // éris perdeu
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            money: {
                                increment: game.amountAposted * multiplier
                            }
                        }
                    })

                    removeBlackjackGame(userId);

                    interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "thinking", { wins: "user" }))
                    return;
                }
                // eris ainda não perdeu
                const comentary = game.erisComentary();
                game.turnCount++;
                game.passCount = 0;
                setBlackjackGame(userId, game)
                await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "hit"))
                if (game.getErisDifficulty() !== 0) await interaction.followUp({ content: comentary, flags })
                return;
            }
            // eris passou
            const comentary = game.erisComentary();
            game.turnCount++;
            game.passCount++;
            setBlackjackGame(userId, game)
            await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "pass"))
            if (game.getErisDifficulty() !== 0) await interaction.followUp({ content: comentary, flags })
            return;
        }

        switch (action) {
            case "hit": {
                const card = game.userTurn();

                if (!card) {
                    // usuário perdeu
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            money: {
                                decrement: game.amountAposted
                            }
                        }
                    })

                    removeBlackjackGame(userId);

                    interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "thinking", { wins: "eris" }))
                    return;
                }

                game.turnCount++;
                game.passCount = 0;
                await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "thinking", { disableButtons: true }));

                await new Promise(resolve => setTimeout(resolve, 2000));

                await erisAction()
                return;
            }
            case "pass": {
                if (game.passCount >= 3) {
                    const userWon = game.userStops();

                    if (userWon === "user") {
                        await prisma.user.update({
                            where: { id: userId },
                            data: {
                                money: {
                                    increment: game.amountAposted * multiplier
                                }
                            }
                        })
                    } else if (userWon === "eris") {
                        await prisma.user.update({
                            where: { id: userId },
                            data: {
                                money: {
                                    decrement: game.amountAposted
                                }
                            }
                        })
                    } // empate não faz nada com o saldo do usuário

                    interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "thinking", { wins: userWon }))
                    removeBlackjackGame(userId)
                    return;
                }
                await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "thinking", { disableButtons: true }));

                game.turnCount++;
                game.passCount++;
                await new Promise(resolve => setTimeout(resolve, 2000));

                await erisAction()
                return;
            }
            case "stand": {
                const userWon = game.userStops();

                if (userWon === "user") {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            money: {
                                increment: game.amountAposted * multiplier
                            }
                        }
                    })
                } else if (userWon === "eris") {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            money: {
                                decrement: game.amountAposted
                            }
                        }
                    })
                } // empate não faz nada com o saldo do usuário

                interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, game, "thinking", { wins: userWon }))
                removeBlackjackGame(userId)
                return;
            }
        }
    },
});