import { prisma } from "#database";
import { ErisError, registerLog } from "#functions";
import { getLang, translate } from "#locale";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyBalanceCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options } = interaction
    const id = options.getUser("user")?.id || interaction.user.id;

    const lang = getLang(interaction.locale);
    const t = translate.commands.balance[lang];
    
    if (id === interaction.client.user?.id) throw new ErisError(t.erisMoney, false);
    if (options.getUser("user")?.bot) throw new ErisError(t.botMoney, false)

    await interaction.deferReply();

    const userData = await prisma.user.upsert({
        where: {
            id
        },
        select: {
            money: true,
        },
        create: {
            id
        },
        update: {}
    });

    const money = userData?.money.toNumber()

    const messages = t.message(money, id);

    const embed = createEmbed({
        description: "### " + messages[Math.floor(Math.random() * messages.length)],
        color: settings.colors.fuchsia,
        timestamp: new Date().toISOString(),
        thumbnail: options.getUser("user")?.avatarURL() || interaction.user.avatarURL(),
    })

    await interaction.editReply({ embeds: [embed] });

    await registerLog({
        level: 1,
        message: t.log(id, interaction.user.id),
        tags: ["economy", "balance"],
        type: "info",
        user: id
    })
    return;
}