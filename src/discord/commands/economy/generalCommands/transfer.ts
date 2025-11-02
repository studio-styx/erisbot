import { Store } from "#base";
import { prisma } from "#database";
import { icon, calculateDate, ErisError } from "#functions";
import { getLang, translate } from "#locale";
import { settings } from "#settings";
import { createEmbed, createRow, createContainer, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, UserSelectMenuBuilder } from "discord.js";

const cooldown = new Store<Date>();

export async function economyTransferCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const inCooldown = cooldown.get(interaction.user.id);

    const lang = getLang(interaction.locale);
    const t = translate.commands.transfer[lang];

    if (inCooldown && inCooldown > new Date()) throw new ErisError(t.cooldown(inCooldown), false);

    const { options } = interaction

    const user = options.getUser("user");
    let value = options.getNumber("amount", true);

    if (!user) {
        await interaction.deferReply();

        const author = await prisma.user.findUnique({ where: { id: interaction.user.id } })

        if (!author) throw new ErisError(t.firstUse, false);

        if (value > author.money.toNumber()) {
            value = author.money.toNumber();
        }

        if (value < 15) throw new ErisError(t.notEnoughMoney, false);

        const container = createContainer(settings.colors.bravery, [
            t.manyTransferContainer.title,
            createSeparator(),
            t.manyTransferContainer.description(value),
            new UserSelectMenuBuilder({
                customId: `manyTransfer/${interaction.user.id}/${value}`,
                minValues: 1,
                maxValues: Math.min(10, Math.floor(author.money.toNumber() / value)),
                placeholder: t.manyTransferContainer.placeholder,
            })
        ])

        interaction.editReply({
            flags: ["IsComponentsV2"],
            components: [container]
        })
        cooldown.set(interaction.user.id, new Date(Date.now() + 40 * 1000), { time: 40 * 1000 });
        return;
    }

    if (user.id === interaction.user.id) throw new ErisError(t.ownTransfer, false);
    if (user.id === interaction.client.user?.id) throw new ErisError(t.erisTransfer, false);
    if (user.bot) throw new ErisError(t.botTransfer);

    const authorId: string = interaction.user.id;
    const targetId: string = user.id;

    await interaction.deferReply();

    const author = await prisma.user.findUnique({ where: { id: authorId } })

    if (!author) throw new ErisError(t.firstUse, false);

    if (value > author.money.toNumber()) {
        value = author.money.toNumber();
    }

    if (value < 15) throw new ErisError(t.notEnoughMoney, false);

    const [_target, transaction] = await prisma.$transaction([
        prisma.user.upsert({
            where: { id: targetId },
            create: { id: targetId },
            update: {}
        }),
        prisma.transaction.create({
            data: {
                amount: value,
                userId: authorId,
                targetId: targetId,
                type: "USER",
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                expiresAt: calculateDate({ time: "1d", typeCalc: "increment" })
            },
            select: { id: true }
        })
    ])

    const embed = createEmbed({
        title: t.embed.title,
        description: t.embed.description(authorId, targetId, value),
        timestamp: new Date().toISOString(),
        color: settings.colors.success
    });
    const row = createRow(
        new ButtonBuilder({
            customId: `transfer/${authorId}/0/${targetId}/0/${transaction.id}`,
            emoji: icon.paid,
            label: t.button,
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