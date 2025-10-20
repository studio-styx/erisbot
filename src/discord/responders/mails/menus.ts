import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { res, icon } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "mail/menu/:menu/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }

        await interaction.deferUpdate()

        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
            include: { mails: { orderBy: { createdAt: "desc" } } }
        });

        await interaction.editReply(menus.mails.userMails(user.mails, user))
        return;
    },
});