import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { res, icon } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "mail/menu/:menu/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId, menu }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }
        
        await interaction.deferUpdate()

        if (menu === "unIgnoreTag") {
            const user = await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: { id: userId }
            });
    
            if (user.mailsTagsIgnored.length === 0) {
                interaction.reply(res.danger(`${icon.denied} | Vocẽ não ignorou nenhuma tag!`))
                return;
            }

            interaction.editReply(menus.mails.ignoreTags(user))
            return;
        } else {
            const user = await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: { id: userId },
                include: { mails: { orderBy: { createdAt: "desc" } } }
            });

            await interaction.editReply(menus.mails.userMails(user.mails, user))
            return;
        }
    },
});