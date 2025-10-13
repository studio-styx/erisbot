import { prisma } from "#database";
import { res, getBlackjackGame, resv2 } from "#functions";
import { getLang, translate } from "#locale";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

export async function blackjackCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author, locale } = interaction;

    const lang = getLang(locale);
    const t = translate.commands.blackjack[lang];

    const game = getBlackjackGame(author.id);
    if (game) {
        interaction.reply(resv2.danger(t.errors.alreadyInGame.text, createRow(
            new ButtonBuilder({
                customId: "blackjack/delete/delete",
                label: t.errors.alreadyInGame.button,
                style: ButtonStyle.Danger
            })
        )))
        return;
    }

    await interaction.deferReply();

    let amount = options.getNumber("amount", true);
    const user = await prisma.user.findUnique({ where: { id: author.id } });
    if (!user) {
        interaction.editReply(res.danger(t.errors.notEnoughMoney));
        return;
    }
    if (user.money.toNumber() < amount) amount = user.money.toNumber();
    if (user.money.toNumber() < 50) {
        interaction.editReply(res.danger(t.errors.notEnoughMoney));
        return;
    }

    await interaction.editReply(menus.cassino.blackjack(author.id, amount, lang))
}