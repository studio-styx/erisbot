import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getBlackjackGame, icon, removeBlackjackGame, res, setBlackjackGame } from "#functions";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

createResponder({
    customId: "blackjack/:authorId/:action/:amount",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { authorId, action, amount }) {
        if (interaction.user.id !== authorId) {
            await interaction.reply(res.danger(`${icon.denied} | Eu sei que é legal jogar uma partida mas esse jogo não é seu!`));
            return;
        }
        const game = getBlackjackGame(authorId);
        if (!game) {
            await interaction.reply(res.danger(`${icon.denied} | A partida durou muito e foi apagada!`));
            return;
        }

        const blackJackEmbed = (comentary: string = "...", erisHand: boolean = false) => {
            const embed = createEmbed({
                title: "🃏 Blackjack",
                description: comentary,
                fields: defaultBlackjackEmbedFields(erisHand),
                color: settings.colors.fuchsia
            });
            return embed;
        };

        const defaultBlackjackEmbedFields = (erisHand: boolean = false) => [
            { name: "Humor da Éris", value: game.getErisHumor() },
            { name: erisHand ? "Mão da éris": "Cartas da Éris", value: erisHand ? game.calculateHandValue(game.getErisCards()).toString() : game.getErisCards().map(__ => "?").join(", ") },
            { name: "Sua mão", value: game.calculateHandValue(game.getUserCards()).toString() },
            { name: "Cartas restantes no deck", value: game.getRemainingCards().length.toString() },
            { name: "Valor apostado", value: amount.toString() }
        ];

        const embedComponents = (erisTurn: boolean = false) => [
            createRow(
                new ButtonBuilder({
                    customId: `blackjack/${authorId}/getCard/${amount}`,
                    label: "Pegar uma carta",
                    style: ButtonStyle.Success,
                    disabled: erisTurn
                }),
                new ButtonBuilder({
                    customId: `blackjack/${authorId}/pass/${amount}`,
                    label: "Passar",
                    style: ButtonStyle.Danger,
                    disabled: erisTurn
                })
            )
        ];

        await interaction.deferUpdate();
        
        const prismaEndGame = async (winner: boolean) => {
            if (winner) {
                return await prisma.user.update({
                    where: { id: interaction.user.id },
                    data: { money: { increment: Number(amount) * 1.5 } }
                })
            } else {
                return await prisma.user.update({
                    where: { id: interaction.user.id },
                    data: { money: { decrement: Number(amount) } }
                })
            }
        }

        const checkPassCountAndEnd = async () => {
            const passCount = (game as any).passCount || 0;
            if (passCount >= 2) {
                await prismaEndGame(game.userStops());
                const won = game.userStops();
                const embed = blackJackEmbed(
                    won ? "Você venceu! 🎉" : "A Éris venceu! 😎"
                , true).setColor(won ? 0x22c55e : 0xED4245);
                await interaction.editReply({ embeds: [embed], components: [] });
                removeBlackjackGame(authorId);
                return true;
            }
            return false;
        };


        switch (action) {
            case "getCard": {
                const userCard = game.userTurn();
                if (userCard === false) {
                    prismaEndGame(false).catch(console.error);
                    const embed = blackJackEmbed("Você estourou! A Éris venceu!", true).setColor(0xED4245);
                    await interaction.editReply({ embeds: [embed], components: [] });
                    removeBlackjackGame(authorId);
                    return;
                }
                const embed = blackJackEmbed(
                    `Você pegou a carta ${(typeof userCard === "object" && "name" in userCard) ? userCard.name : ""}.`
                );
                const erisComentary = game.erisComentary();
                await interaction.editReply({ embeds: [embed], components: embedComponents(true) });
                await interaction.followUp(erisComentary);

                const erisAction = game.decideErisAction();
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (erisAction) {
                    const erisCard = game.erisTurn();
                    if (erisCard === false) {
                        prismaEndGame(true).catch(console.error);
                        const embed = blackJackEmbed("A Éris estourou! Você venceu!", true).setColor(0x22c55e);
                        await interaction.editReply({ embeds: [embed], components: [] });
                        removeBlackjackGame(authorId);
                        return;
                    }
                    const erisEmbed = blackJackEmbed(`A Éris pegou uma carta`);
                    await interaction.editReply({ embeds: [erisEmbed], components: embedComponents() });
                } else {
                    const erisEmbed = blackJackEmbed("A Éris passou.");
                    await interaction.editReply({ embeds: [erisEmbed], components: embedComponents() });
                    if (await checkPassCountAndEnd()) return;
                }

                setBlackjackGame(authorId, game);
                return;
            }
            case "pass": {
                const embed = blackJackEmbed("Você passou.");
                await interaction.editReply({ embeds: [embed], components: embedComponents(true) });

                const erisAction = game.decideErisAction();
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (erisAction) {
                    const erisCard = game.erisTurn();
                    if (erisCard === false) {
                        prismaEndGame(true).catch(console.error);
                        const embed = blackJackEmbed("A Éris estourou! Você venceu!", true).setColor(0x22c55e);
                        await interaction.editReply({ embeds: [embed], components: [] });
                        removeBlackjackGame(authorId);
                        return;
                    }
                    const erisEmbed = blackJackEmbed(`A Éris pegou uma carta`);
                    const erisComentary = game.erisComentary();
                    await interaction.editReply({ embeds: [erisEmbed], components: embedComponents() });
                    await interaction.followUp(erisComentary);
                } else {
                    const erisEmbed = blackJackEmbed("A Éris passou.");
                    await interaction.editReply({ embeds: [erisEmbed], components: embedComponents() });
                    if (await checkPassCountAndEnd()) return;
                }

                setBlackjackGame(authorId, game);
                return;
            }
        }
    },
});