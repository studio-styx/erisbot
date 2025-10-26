import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getBlackjackGame, icon, removeBlackjackGame, res, setBlackjackGame } from "#functions";
import { getLang } from "#locale";
import { menus } from "#menus";

createResponder({
    customId: "blackjack/game/:action/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { userId, action }) {
        const lang = getLang(interaction.locale);

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

            if (erisAction.action === "hit") {
                const card = game.erisTurn(erisAction.card);
                if (!card) {
                    // éris perdeu
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: userId },
                            data: {
                                money: {
                                    increment: game.amountAposted * multiplier
                                }
                            }
                        }),
                        prisma.log.create({
                            data: {
                                userId,
                                type: "info",
                                message: `User won a blackjack game and earned ${game.amountAposted * multiplier} STX. beacuse the dealer busted.`,
                                level: game.amountAposted > 500 ? game.amountAposted >= 1000 ? 5 : 4 : 3,
                                tags: ["blackjack", "game", "win", "economy", "sum", "busted"]
                            }
                        })
                    ])

                    removeBlackjackGame(userId);
                    const comentary = game.erisComentary("user");
                    interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "thinking", { wins: "user", comentary }))
                    return;
                }
                // eris ainda não perdeu
                const comentary = game.erisComentary();
                game.turnCount++;
                game.passCount = 0;
                setBlackjackGame(userId, game)
                await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "hit", {
                    comentary: game.getErisDifficulty() !== 0 ? comentary : undefined
                }))
                return;
            }
            // eris passou
            const comentary = game.erisComentary();
            game.turnCount++;
            game.passCount++;
            setBlackjackGame(userId, game)
            await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "pass", {
                comentary: game.getErisDifficulty() !== 0 ? comentary : undefined
            }))
            return;
        }

        switch (action) {
            case "hit": {
                const card = game.userTurn();

                if (!card) {
                    // usuário perdeu
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: userId },
                            data: {
                                money: {
                                    decrement: game.amountAposted
                                }
                            }
                        }),
                        prisma.log.create({
                            data: {
                                userId: userId,
                                type: "info",
                                message: `User lost a blackjack game and lost ${game.amountAposted} STX. because the user busted.`,
                                level: game.amountAposted > 500 ? 4 : 3,
                                tags: ["blackjack", "game", "loss", "economy", "sub", "busted"]
                            }
                        })
                    ])

                    removeBlackjackGame(userId);

                    const comentary = game.erisComentary("eris");
                    interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "thinking", { wins: "eris", comentary }))
                    return;
                }

                game.turnCount++;
                game.passCount = 0;
                await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "thinking", { disableButtons: true }));

                await new Promise(resolve => setTimeout(resolve, 2000));

                await erisAction()
                return;
            }
            case "pass": {
                if (game.passCount >= 3) {
                    const userWon = game.userStops();

                    let comentary: string;
                    if (userWon === "user") {
                        await prisma.$transaction([
                            prisma.user.update({
                                where: { id: userId },
                                data: {
                                    money: {
                                        increment: game.amountAposted * multiplier
                                    }
                                }
                            }),
                            prisma.log.create({
                                data: {
                                    userId,
                                    type: "info",
                                    message: `User won a blackjack game and earned ${game.amountAposted * multiplier} STX. because the hand value is bigger to dealer after both players passed.`,
                                    level: game.amountAposted > 500 ? game.amountAposted >= 1000 ? 5 : 4 : 3,
                                    tags: ["blackjack", "game", "win", "economy", "sum", "both_passed"]
                                }
                            })
                        ])

                        comentary = game.erisComentary("user");
                    } else if (userWon === "eris") {
                        await prisma.$transaction([
                            prisma.user.update({
                                where: { id: userId },
                                data: {
                                    money: {
                                        decrement: game.amountAposted
                                    }
                                }
                            }),
                            prisma.log.create({
                                data: {
                                    userId: userId,
                                    type: "info",
                                    message: `User lost a blackjack game and lost ${game.amountAposted} STX. because the hand value is smaller to dealer after both players passed.`,
                                    level: game.amountAposted > 500 ? 4 : 3,
                                    tags: ["blackjack", "game", "loss", "economy", "sub", "both_passed"]
                                }
                            })
                        ])

                        comentary = game.erisComentary("eris");
                    } else {
                        comentary = game.erisComentary("push");
                        await prisma.log.create({
                            data: {
                                userId,
                                type: "info",
                                message: `User pushed a blackjack game after both players passed.`,
                                level: 2,
                                tags: ["blackjack", "game", "push", "both_passed"]
                            }
                        })
                    } // empate não faz nada com o saldo do usuário

                    interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "thinking", { wins: userWon, comentary }))
                    removeBlackjackGame(userId)
                    return;
                }
                await interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "thinking", { disableButtons: true }));

                game.turnCount++;
                game.passCount++;
                await new Promise(resolve => setTimeout(resolve, 2000));

                await erisAction()
                return;
            }
            case "stand": {
                const userWon = game.userStops();

                let comentary: string;
                if (userWon === "user") {
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: userId },
                            data: {
                                money: {
                                    increment: game.amountAposted * multiplier
                                }
                            }
                        }),
                        prisma.log.create({
                            data: {
                                userId,
                                type: "info",
                                message: `User won a blackjack game and earned ${game.amountAposted * multiplier} STX. because the hand value is bigger to dealer after stand.`,
                                level: game.amountAposted > 500 ? game.amountAposted >= 1000 ? 5 : 4 : 3,
                                tags: ["blackjack", "game", "win", "economy", "sum", "stand"]
                            }
                        })
                    ])

                    comentary = game.erisComentary("user");
                } else if (userWon === "eris") {
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: userId },
                            data: {
                                money: {
                                    decrement: game.amountAposted
                                }
                            }
                        }),
                        prisma.log.create({
                            data: {
                                userId: userId,
                                type: "info",
                                message: `User lost a blackjack game and lost ${game.amountAposted} STX. because the hand value is smaller to dealer after stand.`,
                                level: game.amountAposted > 500 ? 4 : 3,
                                tags: ["blackjack", "game", "loss", "economy", "sub", "stand"]
                            }
                        })
                    ])

                    comentary = game.erisComentary("eris");
                } else {
                    comentary = game.erisComentary("push");
                    await prisma.log.create({
                        data: {
                            userId,
                            type: "info",
                            message: `User pushed a blackjack game after stand.`,
                            level: 2,
                            tags: ["blackjack", "game", "push", "stand"]
                        }
                    })
                } // empate não faz nada com o saldo do usuário


                interaction.editReply(menus.cassino.blackjack(userId, game.amountAposted, lang, game, "thinking", { wins: userWon, comentary }))
                removeBlackjackGame(userId)
                return;
            }
        }
    },
});