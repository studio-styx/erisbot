import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getBlackjackGameMultiplayer, icon, res, resv2, smufleCards, calculateHandValue, setBlackjackGameMultiplayer } from "#functions";
import { menus } from "#menus";
import { BlackjackMultiplayerGame } from "#types/blackjackMultiplayerGame.js";

createResponder({
    customId: "blackjack/start/other/accept/:userId/:targetId/:amount",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            userId: params.userId,
            targetId: params.targetId,
            amount: Number(params.amount),
        }
    },
    async run(interaction, { userId, targetId, amount }) {
        if (interaction.user.id === userId) {
            interaction.update(resv2.danger(`${icon.success} | Você cancelou o convite.`));
            return;
        }
        if (interaction.user.id !== targetId) {
            interaction.reply(resv2.danger(`${icon.denied} | Você não foi convidado para essa partida.`));
            return;
        }
        const existingGame = getBlackjackGameMultiplayer(interaction.message.id);
        if (!existingGame) {
            interaction.reply(resv2.danger(`${icon.denied} | Você demorou demais para aceitar essa partida!`));
            return;
        }

        // verificar se ambos podem pagar
        await interaction.deferUpdate();
        const [user, target] = await prisma.$transaction([
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
        if (user.money.toNumber() < amount) {
            interaction.editReply(resv2.danger(`${icon.denied} | O jogador que te convidou não tem dinheiro suficiente para apostar.`));
            return;
        }
        if (target.money.toNumber() < amount) {
            interaction.editReply(resv2.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar. Você precisa ter **${amount}** em sua carteira para aceitar o convite.`));
            return;
        }

        const msg = await interaction.editReply(resv2.warning(`${icon.waiting_white} | Preparando o jogo...`))

        const cards = smufleCards();

        const game: BlackjackMultiplayerGame = {
            userId,
            targetId,
            amount,
            userHand: cards.userCards,
            targetHand: cards.targetCards,
            turn: "user",
            wins: null,
            channelId: interaction.channelId!,
            guildId: interaction.guildId!,
            messageId: msg.id,
            passCount: 0,
            rounds: 0,
            remaningCards: cards.remaningCards,
            userInteraction: existingGame.userInteraction,
            targetInteraction: interaction,
        }

        setBlackjackGameMultiplayer(msg.id, game);

        await interaction.editReply(menus.cassino.blackjackMultiplayer(game));
        if (game.userInteraction.isAutocomplete()) return;
        await game.userInteraction.followUp(res.fuchsia(`${icon.success} | Suas cartas: ${game.userHand.map(c => `\`${c.name}\``).join(", ")}, valor da sua mão: **${calculateHandValue(game.userHand)}**`));
        if (game.targetInteraction.isAutocomplete()) return;
        await game.targetInteraction.followUp(res.fuchsia(`${icon.success} | Suas cartas: ${game.targetHand.map(c => `\`${c.name}\``).join(", ")}, valor da sua mão: **${calculateHandValue(game.targetHand)}**`));
        return;
    },
});