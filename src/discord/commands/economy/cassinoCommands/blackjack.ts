import { prisma } from "#database";
import { res, icon, Humor, BlackjackIA, setBlackjackGame } from "#functions";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

export async function blackjackCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    await interaction.deferReply();

    let amount = options.getNumber("amount", true);
    const user = await prisma.user.findUnique({ where: { id: author.id } });
    if (!user) {
        interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
        return;
    }
    if (user.money.toNumber() < amount) amount = user.money.toNumber();
    if (user.money.toNumber() < 50) {
        interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
        return;
    }

    const emotions: Humor[] = ["angry", "happy", "sad", "neutral", "scared", "surprised", "confused"];

    const game = new BlackjackIA(emotions[Math.floor(Math.random() * emotions.length)], 0.3)
    game.startGame();

    const embed = createEmbed({
        title: "🃏 Blackjack",
        description: `Você irá jogar contra éris!`,
        fields: [
            { name: "Humor da Éris", value: game.getErisHumor() },
            { name: "Cartas da Éris", value: game.getErisCards().map(__ => "?").join(", ") },
            { name: "Sua mão", value: game.calculateHandValue(game.getUserCards()).toString() },
            { name: "Cartas restantes no deck", value: game.getRemainingCards().length.toString() },
            { name: "Valor apostado", value: amount.toString() }
        ],
        color: settings.colors.fuchsia
    });

    const components = [
        createRow(
            new ButtonBuilder({
                customId: `blackjack/${author.id}/getCard/${amount}`,
                label: "Pegar uma carta",
                style: ButtonStyle.Success
            }),
            new ButtonBuilder({
                customId: `blackjack/${author.id}/pass/${amount}`,
                label: "Passar",
                style: ButtonStyle.Danger
            })
        )
    ];

    setBlackjackGame(author.id, game);

    await interaction.editReply({ embeds: [embed], components: components });
}