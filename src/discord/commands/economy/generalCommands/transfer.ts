import { Store } from "#base";
import { prisma } from "#database";
import { res, icon } from "#functions";
import { settings } from "#settings";
import { createEmbed, brBuilder, createRow, createContainer, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time, userMention, UserSelectMenuBuilder } from "discord.js";

const cooldown = new Store<Date>();

export async function economyTransferCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const inCooldown = cooldown.get(interaction.user.id);

    if (inCooldown && inCooldown > new Date()) {
        interaction.reply(res.fuchsia(`**${icon.denied_pink} | Eu sei que distribuir dinheiro é legal, mas por favor aguarde um pouco, volte ${time(inCooldown)}**`));
        return;
    }

    const { options } = interaction

    const user = options.getUser("user");
    let value = options.getNumber("amount", true);

    if (!user) {
        await interaction.deferReply();

        const author = await prisma.user.findUnique({ where: { id: interaction.user.id } })

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
        const container = createContainer(settings.colors.bravery, [
            brBuilder(
                `## Transação`
            ),
            createSeparator(),
            brBuilder(
                "Você não mencionou nenhum usuário para fazer a transação, por isso você pode escolher 1 ou mais usuários para transferir stx de maneira rápida e fácil!",
                "",
                "Os usuários escolhidos tem que aceitar a transação, o máximo de usuários para a transação é **10**, para evitar abusos, mas **atenção**: você precisa ter a quantidade de stx que irá distribuir pra cada usuário, ou seja, se vc quer distribuir 50 stx para 4 usuários, então você precisa ter 50 vezes 4 stx que é: 200",
                "",
                `Se o limite de usuários for menor que 10, significa que você não tem o dinheiro necessário para transferir **${value}** para 10 usuários`,
                "",
                "Por favor escolha os usuários para distribuir os seus stx!"
            ),
            new UserSelectMenuBuilder({
                customId: `manyTransfer/${interaction.user.id}/${value}`,
                minValues: 1,
                maxValues: Math.min(10, Math.floor(author.money.toNumber() / value)),
                placeholder: "Usuários a transferir o dinheiro",
            })
        ])

        interaction.editReply({
            flags: ["IsComponentsV2"],
            components: [container]
        })
        cooldown.set(interaction.user.id, new Date(Date.now() + 40 * 1000), { time: 40 * 1000 });
        return;
    }

    if (user.id === interaction.user.id) {
        interaction.reply(res.fuchsia(`**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra você mesmo? se for pra dá dinheiro dá pra mim!**`));
        return;
    }
    if (user.id === interaction.client.user?.id) {
        interaction.reply(res.fuchsia(`**${icon.denied_pink} | Eu queria tanto poder receber esse dinheiro! mas minhas regras não permitem isso! ${icon.Eris_cry_left}**`));
        return;
    }
    if (user.bot) {
        interaction.reply(res.fuchsia(`**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra um bot? se for pra dá dinheiro dá pra mim!**`));
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

    const transaction = await prisma.transaction.create({
        data: {
            amount: value,
            userId: authorId,
            targetId: targetId,
            type: "USER",
            guildId: interaction.guildId,
            channelId: interaction.channelId,
        },
        select: { id: true }
    })

    const embed = createEmbed({
        title: `Transferência`,
        description: brBuilder(
            `${icon.alarm} | ${userMention(authorId)} quer enviar **${value}** styx para ${userMention(targetId)}, ambos precisam apertar no botão abaixo para que a transferência seja concluida`,
        ),
        color: settings.colors.success
    });
    const row = createRow(
        new ButtonBuilder({
            customId: `transfer/${authorId}/0/${targetId}/0/${transaction.id}`,
            emoji: icon.paid,
            label: "Confirmar ( 0/2 )",
            style: ButtonStyle.Success
        })
    )

    const msg = await interaction.editReply({ embeds: [embed], components: [row] });
    cooldown.set(interaction.user.id, new Date(Date.now() + 20 * 1000), { time: 20 * 1000 });

    await prisma.transaction.update({
        where: { id: transaction.id },
        data: { messageId: msg.id }
    })
    return;
}