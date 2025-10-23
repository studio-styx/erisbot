import { prisma } from "#database";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function EconomyJobsCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const companys = await prisma.company.findMany({
        where: {
            isEnabled: true
        },
        orderBy: [
            {
                experience: "asc"
            },
            {
                difficulty: "asc"
            },
            {
                wage: "desc"
            }
        ]
    });

    interaction.reply(menus.jobs.avaibleJobs(companys, 0))
    return;
}