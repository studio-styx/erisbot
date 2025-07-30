import { createResponder, ResponderType } from "#base";
import { res, icon } from "#functions";
import { menus } from "#menus";
import { PrismaClient } from "#prisma";

const prisma = new PrismaClient();

createResponder({
    customId: "user/logs/:page/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando`));
            return;
        }

        await interaction.deferUpdate();

        const logs = await prisma.log.findMany({
            where: {
                userId,
                type: {
                    not: "debug"
                }
            },
            orderBy: {
                timestamp: "desc"
            }
        });

        interaction.editReply(menus.logsMenu(logs, Number(page), { name: interaction.user.displayName, avatarURL: interaction.user.displayAvatarURL(), id: userId }));
        return;
    },
});