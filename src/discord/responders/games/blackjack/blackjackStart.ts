import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { BlackjackIA, getBlackjackGame, icon, res, resv2, setBlackjackGame } from "#functions";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

createResponder({
    customId: "blackjack/start/:difficulty/:userId/:amount",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId, amount, difficulty }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Eu sei que é legal jogar uma partida mas esse jogo não é seu!`))
            return;
        }

        const existingGame = getBlackjackGame(userId);
        if (existingGame) {
            interaction.reply(resv2.danger(`${icon.denied} | Você já está jogando uma partida, você deseja deletar ela?`, createRow(
                new ButtonBuilder({
                    customId: `blackjack/delete/delete`,
                    label: "Sim",
                    style: ButtonStyle.Danger
                })
            )))
            return;
        }

        const difficultyNumber = Number(difficulty)

        const amountNumber = Number(amount)

        await interaction.deferUpdate();
        const user = (await prisma.user.findUnique({ where: { id: userId } }))!;

        if (amountNumber > user.money.toNumber()) {
            interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
            return;
        };

        const game = new BlackjackIA("Random", difficultyNumber as 0 | 1 | 2 | 3 | 4, amountNumber);
        game.startGame();
        setBlackjackGame(userId, game)

        interaction.editReply(menus.cassino.blackjack(userId, amountNumber, game));
        return;
    },
});