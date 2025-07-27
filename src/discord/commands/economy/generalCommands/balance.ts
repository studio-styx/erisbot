import { prisma } from "#database";
import { icon } from "#functions";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction, userMention } from "discord.js";

export async function economyBalanceCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options } = interaction
    await interaction.deferReply();
    const id = options.getUser("user")?.id || interaction.user.id;
    const userData = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            money: true,
            bank: true
        }
    });

    const money = userData?.money.toNumber() ?? 50;
    const bank = userData?.bank.toNumber() ?? 0;

    const messages: string[] = []

    if (money + bank > 800) {
        messages.push(
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu acho que ele poderia dividir`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem impressionantes: **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária!`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem um saldo impressionante: **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária!`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, que inveja!`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu queria ser que nem ele algum dia...`,
        )
    } else if (money + bank > 200 && money + bank < 800) {
        messages.push(
            `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária.`,
            `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu gostaria de ter isso...`,
            `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, poderia ser mais ${icon.Eris_Angry_left}`,
            `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, ele deve estar feliz com tudo isso de dinheiro`,
        )
    } else {
        messages.push(
            `${icon.money} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária.`,
            `${icon.money} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, muito pouco...`,
            `${icon.money} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu não sei o que fazer só com isso...`,
            `${icon.money} | ${userMention(id)} tem apenas **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu acho que a gente deveria dividir com ele...`,
            `${icon.money} | ${userMention(id)} tem apenas **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, como alguem consegue sobreviver só com isso ${icon.Eris_cry_left}`
        )
    }
    if (money > 500) {
        messages.push(
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua conta e **${bank}** styx em sua conta bancária, como que ele tem coragem pra andar com tudo isso no bolso? ${icon.Eris_thinking_left}`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua conta e **${bank}** styx em sua conta bancária, ele tem muita coragem pra andar com tudo isso no bolso!`,
        )
    }

    const embed = createEmbed({
        description: "### " + messages[Math.floor(Math.random() * messages.length)],
        color: settings.colors.fuchsia,
        timestamp: new Date().toISOString(),
        thumbnail: options.getUser("user")?.avatarURL() || interaction.user.avatarURL(),
    })

    interaction.editReply({ embeds: [embed] });
    return;
}