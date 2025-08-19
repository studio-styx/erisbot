import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function EconomyDismissCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply({ flags });

    const user = await prisma.user.findUnique({
        where: { id: interaction.user.id },
        select: { companyId: true }
    });

    if (!user || !user.companyId) {
        await interaction.editReply(res.danger(`${icon.denied} | você não tem um emprego pra se demitir!`));
        return;
    }

    await prisma.user.update({
        where: { id: interaction.user.id },
        data: { companyId: { set: null } }
    });

    await interaction.editReply(res.danger(`${icon.success} | você saiu do seu emprego!`));

    await registerLog({
        level: 7,
        message: "Saiu de seu emprego",
        tags: ["economy", "dismiss", "job"],
        type: "info",
        user: interaction.user.id
    })
    return;
}