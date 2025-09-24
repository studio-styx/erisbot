import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { BlackjackIA, getBlackjackGame, icon, res, resv2, setBlackjackGame, setBlackjackGameMultiplayer } from "#functions";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

createResponder({
    customId: "blackjack/start/:difficulty/:userId/:amount",
    types: [ResponderType.Button, ResponderType.UserSelect], cache: "cached",
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

        if (difficulty === "other" && interaction.isUserSelectMenu()) {
            const targetId = interaction.values[0];
            if (targetId === userId) {
                interaction.reply(res.danger(`${icon.denied} | Você não pode jogar contra você mesmo.`));
                return;
            }
            await interaction.deferUpdate();
            await interaction.editReply(resv2.warning(`${icon.waiting_white} | Processando...`));
            const target = interaction.guild?.members.cache.get(targetId);
            if (!target) {
                interaction.editReply(res.danger(`${icon.denied} | O jogador selecionado não está mais no servidor.`));
                return;
            }
            if (target.user.bot) {
                interaction.editReply(res.danger(`${icon.denied} | Você não pode jogar contra um bot.`));
                return;
            }

            const [user, targetUser] = await prisma.$transaction([
                prisma.user.upsert({
                    where: { id: userId },
                    create: { id: userId },
                    update: {},
                }),
                prisma.user.upsert({
                    where: { id: targetId },
                    create: { id: targetId },
                    update: {},
                }),
            ]);
            if (user.money.toNumber() < Number(amount)) {
                interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
                return;
            }
            if (targetUser.money.toNumber() < Number(amount)) {
                interaction.editReply(res.danger(`${icon.denied} | O jogador selecionado não tem dinheiro suficiente para apostar.`));
                return;
            }
            const msg = await interaction.editReply(resv2.primary(
                `${icon.waiting_white} | Aguarde o jogador selecionado aceitar...`,
                new ButtonBuilder({
                    customId: `blackjack/start/other/accept/${interaction.user.id}/${targetId}/${amount}`,
                    label: "Aceitar",
                    style: ButtonStyle.Success,
                })
            ))
            setBlackjackGameMultiplayer(msg.id, {
                userId,
                targetId,
                amount: Number(amount),
                userHand: [],
                targetHand: [],
                turn: "user",
                wins: null,
                channelId: interaction.channelId!,
                guildId: interaction.guildId!,
                messageId: msg.id,
                passCount: 0,
                rounds: 0,
                remaningCards: [],
                userInteraction: interaction,
                targetInteraction: interaction,
            })
            return;
        }
        if (interaction.isUserSelectMenu()) return;

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