import { prisma } from "#database";
import { res, registerLog, ErisError } from "#functions";
import { getLang, translate } from "#locale";
import { ChatInputCommandInteraction } from "discord.js";

export async function EconomyDismissCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply({ flags });

    const lang = getLang(interaction.locale);
    const t = translate.commands.dismiss[lang];

    const user = await prisma.user.findUnique({
        where: { id: interaction.user.id },
        select: { companyId: true }
    });

    if (!user || !user.companyId) throw new ErisError(t.noHasWork, false);

    await prisma.user.update({
        where: { id: interaction.user.id },
        data: { companyId: { set: null } }
    });

    await interaction.editReply(res.danger(t.message));

    await registerLog({
        level: 7,
        message: t.log,
        tags: ["economy", "dismiss", "job"],
        type: "info",
        user: interaction.user.id
    })
    return;
}