import { Store } from "#base";
import { getCache, registerLog, setCache, getCommandId, icon, res, resv2, generateGeminiContent } from "#functions";
import { menus } from "#menus";
import { Prisma, PrismaClient } from "#prisma/client";
import { settings } from "#settings";
import { brBuilder, createContainer, createEmbed, createRow, createSeparator, createTextDisplay } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time, userMention } from "discord.js";

const prisma = new PrismaClient()

const cooldowns = new Store<Date>();
const trys = new Store<{ attempts: number; cooldown: Date }>();

export async function generalEconomyCommands(interaction: ChatInputCommandInteraction<"cached">) {
    const { options } = interaction
    const subCommand = options.getSubcommand()

    switch (subCommand) {
        case "balance": {
            await interaction.deferReply();
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

            const money = userData?.money.toNumber() ?? 50;
            const bank = userData?.bank.toNumber() ?? 0;

            const messages: string[] = []

            if (money + bank > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu acho que ele poderia dividir`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem impressionantes: **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem um saldo impressionante: **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, que inveja!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu queria ser que nem ele algum dia...`,
                )
            } else if (money + bank > 200 && money + bank < 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária.`,
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu gostaria de ter isso...`,
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, poderia ser mais ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, ele deve estar feliz com tudo isso de dinheiro`,
                )
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária.`,
                    `${icon.money} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, muito pouco...`,
                    `${icon.money} | ${userMention(id)} tem **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu não sei o que fazer só com isso...`,
                    `${icon.money} | ${userMention(id)} tem apenas **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, eu acho que a gente deveria dividir com ele...`,
                    `${icon.money} | ${userMention(id)} tem apenas **${money}** styx em sua carteira e **${bank}** styx em sua conta bancária, como alguem consegue sobreviver só com isso ${icon.Eris_cry_left}`
                )
            }
            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua conta e **${bank}** styx em sua conta bancária, como que ele tem coragem pra andar com tudo isso no bolso? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** styx em sua conta e **${bank}** styx em sua conta bancária, ele tem muita coragem pra andar com tudo isso no bolso!`,
                )
            }

            const embed = createEmbed({
                description: "### " + messages[Math.floor(Math.random() * messages.length)],
                color: settings.colors.fuchsia,
                timestamp: new Date().toISOString(),
                thumbnail: options.getUser("user")?.avatarURL() || interaction.user.avatarURL(),
            })

            interaction.editReply({ embeds: [embed] });
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
            try {
                const action = subCommand === "deposit" ? "deposit" : "withdraw";

                if (action === "deposit") {
                    if (value > userData.money.toNumber()) {
                        value = userData.money.toNumber();
                    }

                    if (value <= 0) {
                        interaction.editReply(res.danger(`${icon.Eris_cry} | Parece que você não tem dinheiro suficiente para realizar essa transação.`));
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
                        interaction.editReply(res.danger(`${icon.Eris_cry} | Parece que você não tem dinheiro suficiente para realizar essa transação.`));
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

                await prisma.user.findUnique({
                    where: { id },
                    select: { money: true, bank: true },
                });

                await interaction.editReply(res.pink(`${icon.Eris_ok} | ${action === "deposit" ? "Depósito realizado com sucesso!" : "Saque realizado com sucesso!"}`))

                await registerLog(
                    `${icon.success} | ${userMention(id)} ${action === "deposit" ? "Depositou" : "Sacou"} **${value}** ${action === "deposit" ? "na conta bancária" : "da conta bancária"}`,
                    "info",
                    1,
                    id,
                    action
                );
            } catch (error) {
                console.error(error);
                await interaction.editReply(
                    res.danger(`${icon.Eris_cry} | Ocorreu um erro ao realizar a transação. Por favor, tente novamente mais tarde.`)
                );
            }
            return;
        }
        case "daily": {
            const id = interaction.user.id;

            const userTrys = trys.get(`${id}:daily`);
            if (userTrys) {
                if (userTrys.attempts === 1) {
                    const messages = [
                        `${icon.Eris_thinking} | Ei! eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                        `${icon.Eris_thinking} | Eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                        `${icon.denied} | Por favor volte novamente no horário que eu te disse anteriomente!`,
                        `${icon.denied} | Eu já te disse pra voltar ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_thinking} | Calma lá! Você precisa esperar até ${time(userTrys.cooldown, "R")}`,
                        `${icon.denied} | Paciência, jovem! Seu próximo daily só ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_thinking} | Hmm, parece que alguém está ansioso! Volte ${time(userTrys.cooldown, "R")}`,
                        `${icon.denied} | O daily não cresce em árvore! Espere até ${time(userTrys.cooldown, "R")}`
                    ]
                    interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
                } else if (userTrys.attempts === 2) {
                    const messages = [
                        `${icon.Eris_Angry} | Ei! de novo? eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                        `${icon.Eris_Angry} | Eu já te disse pra voltar ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Essa já é a segunda vez que eu disse pra voltar ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Essa já é a segunda vez! por favor volte ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Você tá me zoando? Segunda vez que aviso! Volte ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Tá achando que se insistir eu vou ceder? Volte ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Já cansei de repetir! Segunda vez que falo pra voltar ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Aff, de novo isso? Volte ${time(userTrys.cooldown, "R")} como eu já disse!`
                    ]
                    interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
                } else if (userTrys.attempts === 3) {
                    const messages = [
                        `${icon.Eris_Angry} | Ei! você está me testando? já te disse pra voltar${time(userTrys.cooldown, "R")} três vezes!`,
                        `${icon.Eris_Angry} | Eu já te disse pra voltar${time(userTrys.cooldown, "R")} três vezes!`,
                        `${icon.Eris_Angry} | Essa já é a terceira vez que eu disse pra voltar${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Já chega né? você não vai conseguir outro daily tão rápido assim, volte${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Pela terceira vez: VOLTE ${time(userTrys.cooldown, "R")}!`,
                        `${icon.Eris_Angry} | Tá achando que eu sou o Siri? Pare de me perguntar a mesma coisa!`,
                        `${icon.Eris_Angry} | Já virou falta de educação! Terceira vez que aviso!`,
                        `${icon.Eris_Angry} | Eu devo ter dito umas 300 vezes pra voltar ${time(userTrys.cooldown, "R")}`
                    ]
                    interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
                } else if (userTrys.attempts === 4) {
                    const messages = [
                        `${icon.Eris_Angry} | Eu não vou repetir mais isso, por favor volte${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Eu não vou repetir de novo.`,
                        `${icon.Eris_Angry} | O objetivo era me irritar? ótimo! conseguiu, agora não volte mais novamente.`,
                        `${icon.Eris_Angry} | Mas que coisa! pare com isso! não irei repetir isso!`,
                        `${icon.Eris_Angry} | Você está me testando? não vou repetir isso!`,
                        `${icon.Eris_Angry} | Já chega, não quero mais falar com você!`,
                        `${icon.Eris_Angry} | Chega! Meu limite de paciência acabou!`,
                        `${icon.Eris_Angry} | Pronto, cansei! Vou ignorar você até ${time(userTrys.cooldown, "R")}`,
                        `${icon.Eris_Angry} | Isso já virou assédio! Pare imediatamente!`,
                        `${icon.Eris_Angry} | Eu poderia te mutar por spam, sabia? Último aviso!`
                    ]
                    interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
                } else {
                    trys.set(`${id}:daily`, { attempts: userTrys.attempts + 1, cooldown: userTrys.cooldown }, { time: 1000 * 60 * 2 });
                    return;
                }
                trys.set(`${id}:daily`, { attempts: userTrys.attempts + 1, cooldown: userTrys.cooldown }, { time: 1000 * 60 * 2 });
                return;
            }

            await interaction.deferReply();

            const now = new Date();

            const cooldownData = await prisma.cooldown.findFirst({
                where: { userId: id, name: "daily" },
                select: { willEndIn: true, id: true }
            });

            if (cooldownData?.willEndIn && cooldownData.willEndIn > now) {
                interaction.editReply(res.danger(`${icon.denied} | Você já pegou seu prêmio diário hoje. Tente novamente ${time(cooldownData.willEndIn, "R")}`));
                trys.set(`${id}:daily`, { attempts: 1, cooldown: cooldownData.willEndIn }, { time: 1000 * 60 * 2 });
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

            interaction.editReply(res.fuchsia(`${icon.Eris_enchanted} | Parabéns! você pegou seu prêmio diário de **${dailyValue}** styx! agora você possui: **${newUser.money}** styx em sua carteira! ${icon.Eris_ok_left}`));

            await registerLog(
                `Recebeu o prêmio diário de **${dailyValue}** styx!`,
                "info",
                4,
                id
            );
            return;
        }
        case "transfer": {
            const inCooldown = cooldowns.get(interaction.user.id);

            if (inCooldown && inCooldown > new Date()) {
                interaction.reply(res.pink(`**${icon.denied_pink} | Eu sei que distribuir dinheiro é legal, mas por favor aguarde um pouco, volte ${time(inCooldown)}**`));
                return;
            }

            const user = options.getUser("user", true);
            let value = options.getNumber("amount", true);

            if (user.id === interaction.user.id) {
                interaction.reply(res.pink(`**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra você mesmo? se for pra dá dinheiro dá pra mim!**`));
                return;
            }
            if (user.id === interaction.client.user?.id) {
                interaction.reply(res.pink(`**${icon.denied_pink} | Eu queria tanto poder receber esse dinheiro! mas minhas regras não permitem isso! ${icon.Eris_cry_left}**`));
                return;
            }
            if (user.bot) {
                interaction.reply(res.pink(`**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra um bot? se for pra dá dinheiro dá pra mim!**`));
                return;
            }

            const authorId: string = interaction.user.id;
            const targetId: string = user.id;

            await interaction.deferReply();

            const author = await prisma.user.findUnique({ where: { id: authorId } })

            if (!author) {
                interaction.editReply(res.danger(`${icon.denied} | Ei! por quê você não tenta usar outros comandos? sua primeira vez aqui e já quer dar dinheiro pros outros! ${icon.Eris_Angry_left}`));
                return;
            }

            if (value > author.money.toNumber()) {
                value = author.money.toNumber();
            }

            if (value < 15) {
                interaction.editReply(res.danger(`${icon.denied} | Parece que você não tem dinheiro suficiente para realizar essa transação. ${icon.Eris_cry_left}`));
                return;
            }

            const embed = createEmbed({
                title: `Transferência`,
                description: brBuilder(
                    `${icon.alarm} | ${userMention(authorId)} quer enviar **${value}** styx para ${userMention(targetId)}, ambos precisam apertar no botão abaixo para que a transferência seja concluida`,
                ),
                color: settings.colors.success
            });
            const row = createRow(
                new ButtonBuilder({
                    customId: `transfer/${authorId}/0/${targetId}/0/${value}`,
                    emoji: icon.paid,
                    label: "Confirmar ( 0/2 )",
                    style: ButtonStyle.Success
                })
            )

            interaction.editReply({ embeds: [embed], components: [row] });
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
            if (cooldowns.has(`${interaction.user.id}:work`)) {
                interaction.reply(res.danger(`${icon.denied} | A ia está gerando uma responda pra você. tente novamente mais tarde`));
                return;
            }

            const situation: string | null | undefined = getCache(`${interaction.user.id}-situation`);

            if (situation) {
                interaction.reply(res.danger(`${icon.denied} | Você está participando de um desafio, aguarde ele expirar ou termine ele pra poder usar esse comando novamente.`))
                return;
            }
            await interaction.deferReply();

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

                if (!user || !user.companyId || !user.company) {
                    const commandId = await getCommandId(interaction, "economy")
                    interaction.editReply(res.danger(`${icon.Eris_shy} | Você não tem um emprego! use o comando **</economy general jobs:${commandId}>** para encontrar um emprego!`))
                    return;
                }

                const now = new Date();

                const cooldown = user.cooldowns.find(cooldown => cooldown.name === "work");

                if (cooldown && cooldown.willEndIn > now) {
                    interaction.editReply(res.danger(`${icon.denied} | Você já trabalhou hoje. Tente novamente ${time(cooldown.willEndIn, "R")}`));
                    return;
                }

                const { company } = user

                const percentage = 30 + (user.company.difficulty - 1) * 5;

                if (Math.random() * 100 < percentage) {
                    cooldowns.set(`${interaction.user.id}:work`, new Date(Date.now() + 1000 * 60 * 4), { time: 1000 * 60 * 4 });
                    await interaction.editReply(resv2.warning(`${icon.waiting_white} | Um novo desafio apareceu! por favor aguarde um instante.`));

                    const companyExpectations = (company?.expectations as string[] | { level: number, skill: string }[]);
                    let companyExpectationsFormatted: string;

                    if (Array.isArray(companyExpectations)) {
                        if (typeof companyExpectations[0] === "string") {
                            companyExpectationsFormatted = companyExpectations.join(", ").replace(/, ([^,]*)$/, " e $1");
                        } else {
                            companyExpectationsFormatted = companyExpectations
                                .map((expectation) =>
                                    typeof expectation === "object" && "skill" in expectation
                                        ? `Habilidade: ${expectation.skill}, Nível: ${expectation.level}`
                                        : `Não foi possivel formatar essa expectativa`
                                )
                                .join(", ");
                        }
                    } else {
                        companyExpectationsFormatted = `A empresa não tem expectativas definidas.`;
                    }

                    const prompt = `O usuário ${interaction.user.displayName} está trabalhando em sua empresa. Crie um desafio realista com base nas seguintes informações:\n\nNome da empresa: ${company.name}\nDescrição: ${company.description}\nDificuldade: ${company.difficulty} (1 = muito fácil, 10 = muito difícil)\nExpectativas nos funcionários: ${companyExpectationsFormatted}}\n\nGere uma simulação de situação que poderia ocorrer no dia a dia de trabalho, de acordo com o nível de dificuldade. A situação deve exigir que o usuário diga como reagiria. Não é uma pergunta de entrevista.\n\nRetorne apenas a pergunta, sem explicações, sem aspas e sem comentários adicionais.\nExemplo de formato (não reproduza o exemplo abaixo):\nUm cliente ficou bravo com o atendimento por [motivo] e espera que você resolva.`;

                    const result = await generateGeminiContent(prompt);

                    if (!result.success || !result.text) {
                        await prisma.user.update({
                            where: { id: interaction.user.id },
                            data: { money: { increment: company.wage } }
                        });
                        interaction.editReply(resv2.danger(`${icon.Eris_cry} | Ocorreu um erro ao gerar o desafio, por isso você recebeu o salário normal de: ${company.wage}`));
                        console.error(result.error);

                        await registerLog(
                            `Ocorreu um erro ao fazer uma requisição ao gemini.`,
                            "error",
                            999,
                            interaction.user.id,
                            "work"
                        );
                        await registerLog(
                            `Trabalhou e recebeu seu salário de: **${company.wage}**`,
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
                                `## Um novo desafio surgiu! ${icon.Eris_enchanted_left}`,
                                "Responda a pergunta abaixo, como você reagiria a essa situação?",
                                "-# ╰ obs: se você responder corretamente pode até ganhar um aumento hoje!"
                            ),
                            createSeparator(),
                            createTextDisplay(response, 1),
                            createRow(
                                new ButtonBuilder({
                                    customId: `company/work/${interaction.user.id}`,
                                    label: "Responder",
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
                                        `## Você trabalhou e recebeu seu salário de: **${company.wage}** ${icon.Eris_ok_left}`,
                                        `> Você agora possui: **${newUser.money}** styx em sua carteira!`,
                                        `> E possui: **${newUser.xp}** xp!`,
                                    )
                                ]
                            })
                        ]
                    });

                    await registerLog(
                        `Trabalhou e recebeu seu salário de: **${company.wage}**`,
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
                interaction.editReply(res.danger(`${icon.Eris_cry} | Ocorreu um erro ao usar esse comando.`));
                return;
            }
        }
        case "dismiss": {
            await interaction.deferReply({ flags });

            const user = await prisma.user.findUnique({
                where: { id: interaction.user.id },
                select: { companyId: true }
            });

            if (!user || !user.companyId) {
                await interaction.editReply(res.danger(`${icon.denied} | você não tem um emprego pra se demitir!`));
                return;
            }

            await prisma.user.update({
                where: { id: interaction.user.id },
                data: { companyId: { set: null } }
            });

            await interaction.editReply(res.danger(`${icon.success} | você saiu do seu emprego!`));

            interaction.editReply(res.danger(`${icon.success} | você saiu do seu emprego!`));
            return;
        }
    }
}
