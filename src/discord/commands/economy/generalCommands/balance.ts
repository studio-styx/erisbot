import { prisma } from "#database";
import { icon, registerLog, res } from "#functions";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction, userMention } from "discord.js";

export async function economyBalanceCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options } = interaction
    const id = options.getUser("user")?.id || interaction.user.id;
    
    if (id === interaction.client.user?.id) {
        interaction.reply(res.fuchsia(`**${icon.Eris_cry} | Eu sou pobre, eu não tenho dinheiro! ${icon.Eris_shy_left}**`))
        return;
    }
    if (options.getUser("user")?.bot) {
        interaction.reply(res.danger(`${icon.denied} | Você não pode ver o saldo de um bot!`))
        return;
    }

    await interaction.deferReply();

    const userData = await prisma.user.upsert({
        where: {
            id
        },
        select: {
            money: true,
            bank: true
        },
        create: {
            id: interaction.user.id
        },
        update: {}
    });

    const money = userData?.money.toNumber()
    const bank = userData?.bank.toNumber()

    const messages: string[] = []

    if (money + bank > 800) {
        messages.push(
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu acho que ele poderia dividir`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem impressionantes: **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária!`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem um saldo impressionante: **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária!`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, que inveja!`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu queria ser que nem ele algum dia...`,
        )
    } else if (money + bank > 200 && money + bank < 800) {
        messages.push(
            `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária.`,
            `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu gostaria de ter isso...`,
            `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, poderia ser mais ${icon.Eris_Angry_left}`,
            `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, ele deve estar feliz com tudo isso de dinheiro`,
        )
    } else {
        messages.push(
            `${icon.money} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária.`,
            `${icon.money} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, muito pouco...`,
            `${icon.money} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu não sei o que fazer só com isso...`,
            `${icon.money} | ${userMention(id)} tem apenas **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu acho que a gente deveria dividir com ele...`,
            `${icon.money} | ${userMention(id)} tem apenas **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, como alguem consegue sobreviver só com isso ${icon.Eris_cry_left}`
        )
    }
    if (money > 500) {
        messages.push(
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua conta e **${bank}** stx em sua conta bancária, como que ele tem coragem pra andar com tudo isso no bolso? ${icon.Eris_thinking_left}`,
            `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua conta e **${bank}** stx em sua conta bancária, ele tem muita coragem pra andar com tudo isso no bolso!`,
        )
    }

    const embed = createEmbed({
        description: "### " + messages[Math.floor(Math.random() * messages.length)],
        color: settings.colors.fuchsia,
        timestamp: new Date().toISOString(),
        thumbnail: options.getUser("user")?.avatarURL() || interaction.user.avatarURL(),
    })

    interaction.editReply({ embeds: [embed] });

    await registerLog({
        level: 1,
        message: id === interaction.user.id ? "Verificou o próprio saldo" : `Verificou o saldo de ${userMention(id)}`,
        tags: ["economy", "balance"],
        type: "info",
        user: id
    })
    return;
}