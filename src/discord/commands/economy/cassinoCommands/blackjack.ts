import { prisma } from "#database";
import { res, icon, getBlackjackGame, resv2 } from "#functions";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

export async function blackjackCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    const game = getBlackjackGame(author.id);
    if (game) {
        interaction.reply(resv2.danger(`${icon.denied} | Você já está jogando uma partida, você deseja deletar ela?`, createRow(
            new ButtonBuilder({
                customId: "blackjack/delete/delete",
                label: "Sim",
                style: ButtonStyle.Danger
            })
        )))
        return;
    }

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

    await interaction.editReply(menus.cassino.blackjack(author.id, amount))
}