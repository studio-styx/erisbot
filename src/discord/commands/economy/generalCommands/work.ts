import { Store } from "#base";
import { prisma } from "#database";
import { res, icon, getCache, getCommandId, resv2, generateGeminiContent, registerLog, setCache } from "#functions";
import { settings } from "#settings";
import { createContainer, brBuilder, createSeparator, createTextDisplay, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time } from "discord.js";

const cooldowns = new Store<Date>();


export async function EconomyWorkCommand(interaction: ChatInputCommandInteraction<"cached">) {
    if (cooldowns.has(interaction.user.id)) {
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
            cooldowns.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 4), { time: 1000 * 60 * 4 });
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