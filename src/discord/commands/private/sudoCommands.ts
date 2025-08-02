import { createCommand } from "#base";
import { prisma } from "#database";
import { stocksEventuals, res, icon } from "#functions";
import { Mails } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createSeparator } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, time } from "discord.js";

createCommand({
    name: "sudo",
    description: "sudo commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "database",
            description: "database function",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "test",
            description: "test function",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "force-stock-variation",
            description: "force stock variation",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "send-mail",
            description: "send a mail to one or more users",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "users",
                    description: "id(s), or all",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "content",
                    description: "contents for the mail",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
    ],
    async run(interaction) {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("You are not allowed to use this command!"));
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "database": {
                await interaction.deferReply();
                const [_log, _cooldown, companies, users, stocks, stockHoldings, stockHistories, mails, guildSettings] =
                    await prisma.$transaction([
                        prisma.log.deleteMany(),
                        prisma.cooldown.deleteMany(),
                        prisma.company.findMany(),
                        prisma.user.findMany(),
                        prisma.stock.findMany(),
                        prisma.stockHolding.findMany(),
                        prisma.stockHistory.findMany(),
                        prisma.mails.findMany(),
                        prisma.guildSettings.findMany(),
                    ]);


                const transform = (data: any[]) => data.map(({ id, ...rest }) => rest);

                await prisma.$transaction([
                    prisma.company.deleteMany(),
                    prisma.user.deleteMany(),
                    prisma.stock.deleteMany(),
                    prisma.stockHolding.deleteMany(),
                    prisma.stockHistory.deleteMany(),
                    prisma.mails.deleteMany(),
                    prisma.guildSettings.deleteMany(),
                    prisma.cooldown.deleteMany(),

                    prisma.company.createMany({ data: transform(companies) }),
                    prisma.user.createMany({ data: users }),
                    prisma.stock.createMany({ data: transform(stocks) }),
                    prisma.stockHolding.createMany({ data: transform(stockHoldings) }),
                    prisma.stockHistory.createMany({ data: transform(stockHistories) }),
                    prisma.mails.createMany({ data: transform(mails) }),
                    prisma.guildSettings.createMany({ data: guildSettings }),
                ]);

                interaction.editReply(res.success("Database reset"));
                return;
            }
            case "test": {
                await interaction.deferReply();

                interaction.editReply(res.success("Tested"));
                return;
            }
            case "force-stock-variation": {
                await interaction.deferReply();

                await stocksEventuals();

                interaction.editReply(res.success("Forced stock variation"));
                return;
            }
            case "send-mail": {
                await interaction.deferReply({ flags });
                const users = interaction.options.getString("users", true);
                const content = interaction.options.getString("content", true);

                const sendMailDm = async (mail: Mails) => {
                    const components: any[] = [
                        brBuilder(
                            `# ${icon.mail} | Carta recebida de: ${interaction.user.username}`,
                            `-# ╰ ID da carta: ${mail.id}`,
                            `-# ╰ Data de recebimento: ${time(mail.createdAt, "D")}`
                        ),
                        createSeparator(),
                        "### Conteúdo:",
                        mail.content,
                    ]
                    return createContainer({
                        accentColor: settings.colors.fuchsia,
                        components,
                    })
                }

                if (users === "all") {
                    const allUsers = await prisma.user.findMany();

                    try {
                        await prisma.$transaction(async (tx) => {
                            let usersCount = 0
                            for (const user of allUsers) {
                                const mail = await tx.mails.create({
                                    data: {
                                        content,
                                        userId: user.id,
                                        whoSendId: interaction.user.id
                                    }
                                })
                                usersCount++;
                                if (!user.mailsTagsIgnored) continue;
                                try {
                                    const discordUser = await interaction.client.users.fetch(user.id);
                                    if (discordUser) {
                                        const container = await sendMailDm(mail);
                                        await discordUser.send({ flags: ["IsComponentsV2"], components: [container] })
                                    }
                                } catch (error) {
                                    continue;
                                }
                            }

                            interaction.editReply(res.success(`Sent ${usersCount} mails`));
                        })
                    } catch (error) {
                        console.error(error);
                        interaction.editReply(res.danger("Something went wrong"));
                    }
                    return;
                } else {
                    const usersSeparated: string[] = users.split(",");

                    if (usersSeparated.length === 0) {
                        interaction.editReply(res.danger("No users found"));
                        return;
                    }
                    try {
                        await prisma.$transaction(async (tx) => {
                            const successUsers: string[] = [];
                            const failedUsers: { id: string; reason: string }[] = [];
                            for (const id of usersSeparated) {
                                const discordUser = await interaction.client.users.fetch(id).catch(() => null);

                                if (!discordUser) {
                                    failedUsers.push({ id, reason: "User not found" });
                                    continue;
                                }

                                const user = await tx.user.upsert({
                                    where: { id },
                                    create: { id },
                                    update: {}
                                });

                                const mail = await tx.mails.create({
                                    data: {
                                        content,
                                        userId: id,
                                        whoSendId: interaction.user.id
                                    }
                                });

                                successUsers.push(discordUser.displayName);
                                if (!user.mailsTagsIgnored) continue;
                                try {
                                    const container = await sendMailDm(mail);
                                    await discordUser.send({ flags: ["IsComponentsV2"], components: [container] })
                                } catch (error) {
                                    continue;
                                }
                            }

                            interaction.editReply(res.success(`Sent ${successUsers.length} mails to **${successUsers.length === 0 ? "\`no one\`" : successUsers.join(", ")}** ${failedUsers.length === 0 ? "" : `But failed in: **${failedUsers.map(u => `${u.id} - \`${u.reason}\`**`).join(", ")}`}`))
                        })
                    } catch (error) {
                        console.error(error);
                        interaction.editReply(res.danger("Something went wrong"));
                    }
                    return;
                }
            }
        }
    },
});