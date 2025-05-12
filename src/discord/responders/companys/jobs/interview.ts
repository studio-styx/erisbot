import { createResponder, ResponderType } from "#base";
import { PrismaClient } from "#prisma/client";
import { icon, res } from "#utils";

const prisma = new PrismaClient();

createResponder({
    customId: "companys/interview/:companyId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { companyId }) {
        const company = await prisma.company.findUnique({
            where: {
                id: Number(companyId)
            }
        })

        const user = await prisma.user.findUnique({
            where: {
                id: interaction.user.id
            }
        }) ?? await prisma.user.create({
            data: {
                id: interaction.user.id
            }
        })

        if (!company) {
            interaction.reply(res.danger(`${icon.error} | não foi possivel encontrar essa empresa`))
            return;
        }
        if (user.companyId) {
            interaction.reply(res.danger(`${icon.denied} | você já tem um emprego, use \`/economy general dismiss\` para sair do emprego atual`))
            return;
        }
        if (user.xp < company.experience) {
            interaction.reply(res.danger(`${icon.denied} | você não tem xp suficiente para trabalhar nessa empresa`))
            return;
        }
    },
});