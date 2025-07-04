import { Store } from "#base";
import { registerLog, setCache } from "#functions";
import { generateGeminiContent } from "#logic";
import { menus } from "#menus";
import { Prisma, PrismaClient } from "#prisma/client";
import { settings } from "#settings";
import { icon, res, resv2 } from "#utils";
import { brBuilder, createContainer, createEmbed, createRow, createSeparator, createTextDisplay } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time, userMention } from "discord.js";
import i18next from "i18next";

const prisma = new PrismaClient()

const cooldowns = new Store<Date>();

export async function generalEconomyCommands(interaction: ChatInputCommandInteraction<"cached">) {
    const { options } = interaction
    const subCommand = options.getSubcommand()

    await i18next.changeLanguage(interaction.locale);

    switch (subCommand) {
        case "balance": {
            const id = options.getUser("user")?.id || interaction.user.id;
            const userData = await prisma.user.findUnique({
                where: {
                    id
                },
                select: {
                    money: true,
                    bank: true
                }
            });

            const money = userData?.money ?? 0;
            const bank = userData?.bank ?? 0;

            const t = (key: string, options?: any) => i18next.t(`commands/economy:general.balance.${key}`, options) as string;

            const embed = createEmbed({
                description: t("description", { mention: userMention(id) }),
                fields: [
                    {
                        name: t("field1Title", { emoji: icon.money }),
                        value: t("field1", { money }),
                        inline: true
                    },
                    {
                        name: t("field2Title", { emoji: icon.bank }),
                        value: t("field2", { bank }),
                        inline: true
                    }
                ],
                color: settings.colors.success
            });

            interaction.reply({ embeds: [embed] });
            await registerLog(
                id != interaction.user.id
                    ? t("logMessage1", { id })
                    : t("logMessage2"),
                "info",
                0,
                id
            );
            return;
        }
        case "withdraw":
        case "deposit": {
            let value = interaction.options.getNumber("amount")!;
            await interaction.deferReply({ flags: ["Ephemeral"] });

            const id = interaction.user.id;
            let userData = await prisma.user.findUnique({
                where: { id },
                select: { money: true, bank: true },
            });

            if (!userData) {
                userData = await prisma.user.create({
                    data: { id },
                    select: { money: true, bank: true }
                });
            }

            const t = (key: string, options?: any) => i18next.t(`commands/economy:general.${subCommand}.${key}`, options) as string;
            try {
                const action = subCommand === "deposit" ? "deposit" : "withdraw";

                if (action === "deposit") {
                    if (value > userData.money.toNumber()) {
                        value = userData.money.toNumber();
                    }

                    if (value <= 0) {
                        interaction.editReply(res.danger(t("noFunds")));
                        return;
                    }

                    await prisma.user.update({
                        where: { id },
                        data: {
                            money: { decrement: value },
                            bank: { increment: value },
                        },
                    });
                } else {
                    if (value > userData.bank.toNumber()) {
                        value = userData.bank.toNumber();
                    }

                    if (value <= 0) {
                        interaction.editReply(res.danger(t("noBankFunds")));
                        return;
                    }

                    await prisma.user.update({
                        where: { id },
                        data: {
                            money: { increment: value },
                            bank: { decrement: value },
                        },
                    });
                }

                const updatedUser = await prisma.user.findUnique({
                    where: { id },
                    select: { money: true, bank: true },
                });

                await interaction.editReply(
                    res.success(t("success", { emoji: icon.success, value }), {
                        embeds: [
                            createEmbed({
                                description: t("embed.description", { mention: userMention(id) }),
                                fields: [
                                    {
                                        name: t("embed.field1", { emoji: icon.money }),
                                        value: t("embed.fieldValue", { value: updatedUser?.money.toNumber() || 0 }),
                                        inline: true
                                    },
                                    {
                                        name: t("embed.field2", { emoji: icon.bank }),
                                        value: t("embed.fieldValue", { value: updatedUser?.bank.toNumber() || 0 }),
                                        inline: true
                                    }
                                ],
                                color: "#ffffff"
                            })
                        ]
                    }
                    ));

                await registerLog(
                    t("logMessage", { value }),
                    "info",
                    1,
                    id,
                    action
                );
            } catch (error) {
                console.error(error);
                await interaction.editReply(
                    res.danger(t("error", { error: error instanceof Error ? error.message : "Unknown error" }))
                );
            }
            return;
        }
        case "daily": {
            const id = interaction.user.id;
            await interaction.deferReply();

            const now = new Date();

            const cooldownData = await prisma.cooldown.findFirst({
                where: { userId: id, name: "daily" },
                select: { willEndIn: true, id: true }
            });

            const t = (key: string, options?: any) => i18next.t(`commands/economy:general.daily.${key}`, options) as string;

            if (cooldownData?.willEndIn && cooldownData.willEndIn > now) {
                interaction.editReply(res.danger(t("cooldown", {
                    emoji: icon.denied,
                    time: time(cooldownData.willEndIn, "R")
                })));
                return;
            }

            const dailyValue = Math.floor(Math.random() * 51);

            const willEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            if (cooldownData?.id) {
                await prisma.cooldown.update({
                    where: { id: cooldownData.id },
                    data: { willEndIn: willEnd }
                });
            } else {
                await prisma.cooldown.create({
                    data: { userId: id, name: "daily", willEndIn: willEnd }
                });
            }

            const newUser = await prisma.user.upsert({
                where: { id },
                create: { id },
                update: {
                    money: { increment: new Prisma.Decimal(dailyValue) }
                }
            });

            interaction.editReply(res.success(t("success", {
                emoji: icon.success,
                value: dailyValue
            }), {
                embeds: [
                    createEmbed({
                        description: t("embed.description", { mention: userMention(id) }),
                        fields: [
                            {
                                name: t("embed.field1", { emoji: icon.money }),
                                value: t("embed.fieldValue", { value: newUser.money }),
                                inline: true
                            },
                            {
                                name: t("embed.field2", { emoji: icon.bank }),
                                value: t("embed.fieldValue", { value: newUser.bank }),
                                inline: true
                            }
                        ],
                        color: "#ffffff"
                    })
                ],
                flags: []
            }));

            await registerLog(
                t("logMessage", { value: dailyValue }),
                "info",
                4,
                id
            );
            return;
        }
        case "transfer": {
            const inCooldown = cooldowns.get(interaction.user.id);
            const t = (key: string, options?: any) => i18next.t(`commands/economy:general.transfer.${key}`, options) as string;

            if (inCooldown && inCooldown > new Date()) {
                interaction.reply(res.danger(t("cooldown", {
                    emoji: icon.denied,
                    time: time(inCooldown, "R")
                })));
                return;
            }

            const user = options.getUser("user", true);
            let value = options.getNumber("amount", true);

            if (user.bot) {
                interaction.reply(res.danger(t("botTransfer", { emoji: icon.denied })));
                return;
            }

            const authorId: string = interaction.user.id;
            const targetId: string = user.id;

            await interaction.deferReply();

            const author = await prisma.user.findUnique({ where: { id: authorId } })
                || await prisma.user.create({ data: { id: authorId } });
            const target = await prisma.user.findUnique({ where: { id: targetId } })
                || await prisma.user.create({ data: { id: targetId } });

            if (authorId === targetId) {
                interaction.editReply(res.danger(t("selfTransfer", { emoji: icon.denied })));
                return;
            }

            if (value > author.money.toNumber()) {
                value = author.money.toNumber();
            }

            if (value < 15) {
                interaction.editReply(res.danger(t("minAmount", { emoji: icon.denied })));
                return;
            }

            const newAuthor = await prisma.user.update({
                where: { id: authorId },
                data: {
                    money: { decrement: new Prisma.Decimal(value) }
                }
            });
            const newTarget = await prisma.user.update({
                where: { id: targetId },
                data: {
                    money: { increment: new Prisma.Decimal(value) }
                }
            });

            const transfer = await registerLog(t("logSent", { targetId: userMention(targetId) }), "info", 3, authorId, "transaction");
            await registerLog(t("logReceived", { authorId: userMention(authorId) }), "info", 3, targetId, "transaction");

            const container = createContainer({
                accentColor: settings.colors.success,
                components: [
                    t("transferMessage", {
                        emoji: icon.success,
                        author: userMention(authorId),
                        value,
                        target: userMention(targetId),
                        transactionId: transfer?.id || t("notRegistered")
                    }),
                    createSeparator(),
                    t("authorBalance", {
                        author: userMention(authorId),
                        money: newAuthor.money,
                        bank: newAuthor.bank
                    }),
                    createSeparator(),
                    t("targetBalance", {
                        target: userMention(targetId),
                        money: newTarget.money,
                        bank: newTarget.bank
                    })
                ]
            });

            interaction.editReply({ flags: ["IsComponentsV2"], components: [container] });
            cooldowns.set(interaction.user.id, new Date(Date.now() + 60 * 1000), { time: 60 * 1000 });

            return;
        }
        case "leaderboard": {
            await interaction.deferReply()
            const users = await prisma.user.findMany({
                orderBy: [
                    {
                        money: "desc"
                    },
                    {
                        bank: "desc"
                    }
                ]
            });

            users.sort((a, b) => b.money.add(b.bank).toNumber() - a.money.add(a.bank).toNumber());

            const topUsers = users.slice(0, 10);
            const nextUsers = users.slice(10, 20);

            const richestUser = interaction.client.users.cache.get(topUsers[0].id);
            const findUser = (userid: string) => interaction.client.users.cache.get(userid);

            const embed = createEmbed({
                title: "Leaderboard",
                fields: [
                    {
                        name: "",
                        value: topUsers.map((user, index) => `${index + 1}. ${findUser(user.id)?.displayName} - **${user.money.add(user.bank).toNumber()}** stx`).join("\n"),
                        inline: true
                    }
                ],
                color: settings.colors.success,
                thumbnail: richestUser?.avatarURL(),
                timestamp: new Date().toISOString()
            });

            if (nextUsers.length > 0) {
                embed.addFields([
                    {
                        name: "",
                        value: nextUsers.map((user, index) => `${index + 11}. ${userMention(user.id)} - **${user.money.add(user.bank).toNumber()}** stx`).join("\n"),
                        inline: true
                    }
                ]);
            }

            interaction.editReply({ embeds: [embed] });
            return;
        }
        case "jobs": {
            const companys = await prisma.company.findMany({
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
        case "work": {
            await interaction.deferReply();
        
            const t = (key: string, options?: any) => i18next.t(`commands/economy:general.work.${key}`, { ...options, lng: interaction.locale }) as string;
        
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        id: interaction.user.id
                    },
                    include: {
                        company: true,
                        cooldowns: true
                    }
                })
        
                if (!user || !user.companyId) {
                    interaction.editReply(res.danger(t('no_job', { icon: icon.denied })))
                    return;
                }
        
                const now = new Date();
        
                const cooldown = user.cooldowns.find(cooldown => cooldown.name === "work");
        
                if (cooldown && cooldown.willEndIn > now) {
                    interaction.editReply(res.danger(t('cooldown', { 
                        icon: icon.denied,
                        time: time(cooldown.willEndIn, "R")
                    })))
                    return;
                }
        
                if (!user.company) {
                    interaction.editReply(res.danger(t('no_company', { icon: icon.denied })));
                    return;
                }
        
                const { company } = user
        
                const percentage = 30 + (user.company.difficulty - 1) * 5;
        
                if (Math.random() * 100 < percentage) {
                    await interaction.editReply(resv2.warning(t('waiting', { icon: icon.waiting_white })));
        
                    const companyExpectations = (company?.expectations as string[] | { level: number, skill: string }[]);
                    let companyExpectationsFormatted: string;
        
                    if (Array.isArray(companyExpectations)) {
                        if (typeof companyExpectations[0] === "string") {
                            companyExpectationsFormatted = companyExpectations.join(", ").replace(/, ([^,]*)$/, " e $1");
                        } else {
                            companyExpectationsFormatted = companyExpectations
                                .map((expectation) =>
                                    typeof expectation === "object" && "skill" in expectation
                                        ? t('expectation_format', {
                                            skill: expectation.skill,
                                            level: expectation.level
                                        })
                                        : t('invalid_expectation')
                                )
                                .join(", ");
                        }
                    } else {
                        companyExpectationsFormatted = t('invalid_company_expectations');
                    }
        
                    const prompt = t('gemini_prompt', {
                        displayName: interaction.user.displayName,
                        companyName: company.name,
                        companyDescription: company.description || t('no_description'),
                        difficulty: company.difficulty,
                        expectations: companyExpectationsFormatted
                    });
        
                    const result = await generateGeminiContent(prompt);
        
                    if (!result.success || !result.text) {
                        interaction.editReply(resv2.danger(t('gemini_error', { 
                            icon: icon.error,
                            wage: company.wage 
                        })));
                        await prisma.user.update({
                            where: { id: interaction.user.id },
                            data: { money: { increment: company.wage } }
                        });
        
                        console.error(result.error);
        
                        await registerLog(
                            t('log.gemini_error'),
                            "error",
                            999,
                            interaction.user.id,
                            "work"
                        );
                        await registerLog(
                            t('log.worked_normal', { wage: company.wage }),
                            "info",
                            5,
                            interaction.user.id,
                            "work"
                        );
        
                        return;
                    }
        
                    const response = result.text;
        
                    const container = createContainer({
                        accentColor: settings.colors.warning,
                        components: [
                            brBuilder(
                                t('challenge.title'),
                                t('challenge.description'),
                                t('challenge.note')
                            ),
                            createSeparator(),
                            createTextDisplay(response, 1),
                            createRow(
                                new ButtonBuilder({
                                    customId: `company/work/${interaction.user.id}`,
                                    label: t('challenge.button'),
                                    style: ButtonStyle.Primary
                                })
                            )
                        ]
                    });
        
                    setCache(`${interaction.user.id}-situation`, response);
        
                    interaction.editReply({ flags: ["IsComponentsV2"], components: [container] });
                } else {
                    const newUser = await prisma.user.update({
                        where: { id: interaction.user.id },
                        data: { 
                            money: { increment: company.wage }, 
                            xp: { increment: Math.floor(Math.random() * (25 - 10 + 1)) + 10 } 
                        }
                    });
        
                    interaction.editReply({
                        flags: ["IsComponentsV2"],
                        components: [
                            createContainer({
                                accentColor: settings.colors.success,
                                components: [
                                    brBuilder(
                                        t('success.title', { 
                                            icon: icon.success,
                                            wage: company.wage 
                                        }),
                                        t('success.balance', { user: userMention(interaction.user.id) }),
                                        t('success.money', { 
                                            icon: icon.money,
                                            money: newUser.money 
                                        }),
                                        t('success.bank', { 
                                            icon: icon.bank,
                                            bank: newUser.bank 
                                        })
                                    )
                                ]
                            })
                        ]
                    });
        
                    await registerLog(
                        t('log.worked_normal', { wage: company.wage }),
                        "info",
                        5,
                        interaction.user.id,
                        "work"
                    );
                }
        
                await prisma.cooldown.upsert({
                    where: {
                        userId_name: {
                            userId: interaction.user.id,
                            name: "work"
                        }
                    },
                    update: {
                        willEndIn: new Date(now.getTime() + (1000 * 60 * 60) * 2)
                    },
                    create: {
                        userId: interaction.user.id,
                        name: "work",
                        willEndIn: new Date(now.getTime() + (1000 * 60 * 60) * 2)
                    }
                });
                return;
            } catch (error) {
                console.error(error);
                interaction.editReply(res.danger(t('unexpected_error', { icon: icon.error })))
                return;
            }
        }
        case "dismiss": {
            await interaction.deferReply({ flags });

            await prisma.user.update({
                where: { id: interaction.user.id },
                data: {
                    companyId: { set: null }
                }
            });

            interaction.editReply(res.danger(`${icon.success} | você saiu do seu emprego!`));
            return;
        }
    }
}
