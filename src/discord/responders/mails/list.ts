import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "mail/list/:page/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`));
            return;
        }

        await interaction.deferUpdate()

        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
            include: { mails: true }
        })
        interaction.editReply(menus.mails(user.mails, user, Number(page)))
        return;
    },
});