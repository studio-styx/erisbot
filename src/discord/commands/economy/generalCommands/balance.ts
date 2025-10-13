import { prisma } from "#database";
import { registerLog, res } from "#functions";
import { getLang, translate } from "#locale";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyBalanceCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options } = interaction
    const id = options.getUser("user")?.id || interaction.user.id;

    const lang = getLang(interaction.locale);
    const t = translate.commands.balance[lang];
    
    if (id === interaction.client.user?.id) {
        interaction.reply(res.fuchsia(t.erisMoney))
        return;
    }
    if (options.getUser("user")?.bot) {
        interaction.reply(res.danger(t.botMoney))
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
            id
        },
        update: {}
    });

    const money = userData?.money.toNumber()
    const bank = userData?.bank.toNumber()

    const messages = t.message(money, bank, id);

    const embed = createEmbed({
        description: "### " + messages[Math.floor(Math.random() * messages.length)],
        color: settings.colors.fuchsia,
        timestamp: new Date().toISOString(),
        thumbnail: options.getUser("user")?.avatarURL() || interaction.user.avatarURL(),
    })

    interaction.editReply({ embeds: [embed] });

    await registerLog({
        level: 1,
        message: t.log(id, interaction.user.id),
        tags: ["economy", "balance"],
        type: "info",
        user: id
    })
    return;
}