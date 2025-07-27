import { Store } from "#base";
import { prisma } from "#database";
import { res, icon } from "#functions";
import { settings } from "#settings";
import { createEmbed, brBuilder, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time, userMention } from "discord.js";

const cooldown = new Store<Date>();

export async function economyTransferCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const inCooldown = cooldown.get(interaction.user.id);

    if (inCooldown && inCooldown > new Date()) {
        interaction.reply(res.pink(`**${icon.denied_pink} | Eu sei que distribuir dinheiro é legal, mas por favor aguarde um pouco, volte ${time(inCooldown)}**`));
        return;
    }

    const { options } = interaction

    const user = options.getUser("user", true);
    let value = options.getNumber("amount", true);

    if (user.id === interaction.user.id) {
        interaction.reply(res.pink(`**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra você mesmo? se for pra dá dinheiro dá pra mim!**`));
        return;
    }
    if (user.id === interaction.client.user?.id) {
        interaction.reply(res.pink(`**${icon.denied_pink} | Eu queria tanto poder receber esse dinheiro! mas minhas regras não permitem isso! ${icon.Eris_cry_left}**`));
        return;
    }
    if (user.bot) {
        interaction.reply(res.pink(`**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra um bot? se for pra dá dinheiro dá pra mim!**`));
        return;
    }

    const authorId: string = interaction.user.id;
    const targetId: string = user.id;

    await interaction.deferReply();

    const author = await prisma.user.findUnique({ where: { id: authorId } })

    if (!author) {
        interaction.editReply(res.danger(`${icon.denied} | Ei! por quê você não tenta usar outros comandos? sua primeira vez aqui e já quer dar dinheiro pros outros! ${icon.Eris_Angry_left}`));
        return;
    }

    if (value > author.money.toNumber()) {
        value = author.money.toNumber();
    }

    if (value < 15) {
        interaction.editReply(res.danger(`${icon.denied} | Parece que você não tem dinheiro suficiente para realizar essa transação. ${icon.Eris_cry_left}`));
        return;
    }

    const embed = createEmbed({
        title: `Transferência`,
        description: brBuilder(
            `${icon.alarm} | ${userMention(authorId)} quer enviar **${value}** styx para ${userMention(targetId)}, ambos precisam apertar no botão abaixo para que a transferência seja concluida`,
        ),
        color: settings.colors.success
    });
    const row = createRow(
        new ButtonBuilder({
            customId: `transfer/${authorId}/0/${targetId}/0/${value}`,
            emoji: icon.paid,
            label: "Confirmar ( 0/2 )",
            style: ButtonStyle.Success
        })
    )

    interaction.editReply({ embeds: [embed], components: [row] });
    cooldown.set(interaction.user.id, new Date(Date.now() + 60 * 1000), { time: 60 * 1000 });
    return;
}