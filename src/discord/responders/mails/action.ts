import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "mail/action/:action/:userId/:page",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action, userId, page }) {
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
        })

        switch (action) {
            case "deleteall": {
                if (!interaction.isButton()) return;
                if (user.mails.find(m => !m.asRead)) {
                    interaction.followUp(res.danger(`${icon.denied} | você tem cartas não lidas!`));
                    return;
                };

                await prisma.mails.deleteMany({
                    where: { userId }
                });

                await interaction.editReply(menus.mails.userMails([], user))
                await interaction.followUp(res.success(`${icon.success} | Todas as cartas foram apagadas com sucesso!`));
                return;
            }
            case "enableDmNotification": {
                if (!interaction.isButton()) return;
                if (user.dmNotification) {
                    const newUser = await prisma.user.update({
                        where: { id: userId },
                        data: { dmNotification: false }
                    });

                    await interaction.followUp(res.success(`${icon.success} | Você desabilitou notificações de cartas na dm com sucesso!`));
                    await interaction.editReply(menus.mails.userMails(user.mails, newUser, Number(page)))
                    return;
                } else {
                    const newUser = await prisma.user.update({
                        where: { id: userId },
                        data: { dmNotification: true }
                    });

                    await interaction.followUp(res.success(`${icon.success} | Você habilitou notificações de cartas na dm com sucesso!`));
                    await interaction.editReply(menus.mails.userMails(user.mails, newUser, Number(page)))
                    return;
                }
            }
        }
    },
});