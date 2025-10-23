import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { PrismaClient } from "#prisma";

const prisma = new PrismaClient();

createResponder({
    customId: "companys/jobs/:page",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page }) {
        await interaction.deferUpdate();
        const pageN = Number(page);
        
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

        interaction.editReply(menus.jobs.avaibleJobs(companys, pageN))
        return;
    },
});