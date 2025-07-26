import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "mail/actionPage/:action/:mailId/:page/:userId",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { action, userId, mailId, page }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`));
            return;
        }

        const id = parseInt(mailId);

        if (isNaN(id)) {
            interaction.reply(res.danger(`${icon.error} | O id da carta não é um id válido!`))
            return;
        }

        await interaction.deferUpdate()

        switch (action) {
            case "read": {
                if (!interaction.isButton()) return;
                const mail = await prisma.mails.findUnique({
                    where: { id }
                });

                if (!mail) {
                    const user = await prisma.user.upsert({
                        where: { id: userId },
                        update: {},
                        create: { id: userId },
                        include: { mails: { orderBy: { createdAt: "desc" } } }
                    });

                    await interaction.editReply(menus.mails.userMails(user.mails, user))
                    await interaction.followUp(res.danger(`${icon.error} | Não foi possivel achar essa carta`))
                    return;
                }

                if (mail.asRead) {
                    await interaction.followUp(res.danger(`${icon.error} | Essa carta já foi definido como lida`))
                }

                const [_, user] = await prisma.$transaction([
                    prisma.mails.update({
                        where: { id },
                        data: {
                            asRead: true
                        }
                    }),
                    prisma.user.upsert({
                        where: { id: userId },
                        update: {},
                        create: { id: userId },
                        include: { mails: { orderBy: { createdAt: "desc" } } }
                    })
                ])

                await interaction.editReply(menus.mails.userMails(user.mails, user, Number(page)))
                await interaction.followUp(res.success(`${icon.success} | Você marcou como lido a carta id: \`${mail.id}\``))
                return;
            }
            case "delete": {
                if (!interaction.isButton()) return;
                const mail = await prisma.mails.findUnique({
                    where: { id }
                });

                if (!mail) {
                    const user = await prisma.user.upsert({
                        where: { id: userId },
                        update: {},
                        create: { id: userId },
                        include: { mails: { orderBy: { createdAt: "desc" } } }
                    });

                    await interaction.editReply(menus.mails.userMails(user.mails, user))
                    await interaction.followUp(res.danger(`${icon.error} | Não foi possivel achar essa carta`))
                    return;
                }

                const [_, user] = await prisma.$transaction([
                    prisma.mails.delete({
                        where: { id }
                    }),
                    prisma.user.upsert({
                        where: { id: userId },
                        update: {},
                        create: { id: userId },
                        include: { mails: { orderBy: { createdAt: "desc" } } }
                    })
                ])

                const mailsLength = user?.mails.length

                let nextPage = 0
                const pageNum = Number(page)

                if (mailsLength > pageNum) nextPage = pageNum + 1
                else if (mailsLength === 0) nextPage = 0
                else if (mailsLength === pageNum) nextPage = pageNum - 1

                await interaction.editReply(menus.mails.userMails(user.mails, user, nextPage))
                await interaction.followUp(res.success(`${icon.success} | Carta id: \`${id}\` deletado com sucesso!`))
                return;
            }
            case "ignore": {
                if (!interaction.isStringSelectMenu()) return;
                const tags = interaction.values

                if (tags.length === 1 && tags[0] === "alIgnoratedMailTags") {
                    interaction.followUp(res.danger(`${icon.error} | Você já ignorou todas as tags dessa carta`))
                    return;
                }

                const user = await prisma.user.upsert({
                    where: { id: userId },
                    update: {},
                    create: { id: userId },
                    include: { mails: { orderBy: { createdAt: "desc" } } }
                });

                const currentIgnored = new Set(user.mailsTagsIgnored ?? []);

                tags.forEach(tag => currentIgnored.delete(tag));

                tags.forEach(tag => currentIgnored.add(tag));

                const newUser = await prisma.user.upsert({
                    where: { id: userId },
                    update: { mailsTagsIgnored: tags },
                    create: { id: userId, mailsTagsIgnored: tags },
                    include: { mails: { orderBy: { createdAt: "desc" } } }
                });
                
                await interaction.editReply(menus.mails.userMails(newUser.mails, newUser, Number(page)));
                await interaction.followUp(res.success(`${icon.success} | Tags ignoradas com sucesso: ${Array.from(currentIgnored).map(t => `\`${t}\``).join(", ")}`))
            }
        }
    },
});