import { Store } from "#base";
import { prisma } from "#database";
import { res, icon, getCache, getCommandId, resv2, generateGeminiContent, registerLog, setCache, calculateProbability, getRandomValue } from "#functions";
import { Company, Rarity } from "#prisma";
import { settings } from "#settings";
import { createContainer, brBuilder, createSeparator, createTextDisplay, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time } from "discord.js";

const cooldowns = new Store<Date>();

function calculateSkillBonus({ rarity, level }: { rarity: Rarity, level: number }) {
    const rarityMultipliers: Record<Rarity, number> = {
        COMUM: 0.05,
        UNCOMUM: 0.1,
        RARE: 0.15,
        EPIC: 0.25,
        LEGENDARY: 0.4,
    };

    const rarityMultiplier = rarityMultipliers[rarity] ?? 0;
    const levelMultiplier = level * 0.02; // ex: +2% por nível

    // bônus total = (1 + raridade + level)
    return 1 + rarityMultiplier + levelMultiplier;
}

function getWorkChallengePrompt({ userName, company, expectations, hasEasierSkill }: { userName: string, company: Company, expectations: string, hasEasierSkill: boolean }) {
    const basePrompts = [
        brBuilder(
            `O usuário ${userName} está trabalhando em sua empresa.`,
            `Crie um desafio realista com base nas seguintes informações:`,
            ``,
            `Nome da empresa: ${company.name}`,
            `Descrição: ${company.description}`,
            `Dificuldade: ${company.difficulty} (1 = muito fácil, 10 = muito difícil)`,
            `Expectativas nos funcionários: ${expectations}`,
            ``,
            `Gere uma simulação de situação que poderia ocorrer no dia a dia de trabalho, de acordo com o nível de dificuldade. A situação deve exigir que o usuário diga como reagiria.`,
            `Não é uma pergunta de entrevista.`,
            ``,
            `Retorne apenas a pergunta, sem explicações, sem aspas e sem comentários adicionais.`
        ),

        brBuilder(
            `Você é ${userName}, funcionário da empresa ${company.name}.`,
            `Sua empresa é descrita assim: ${company.description}`,
            `Ela espera de seus funcionários: ${expectations}`,
            ``,
            `Crie uma situação inesperada ou desafiadora que possa acontecer nesse ambiente.`,
            `Use a dificuldade (${company.difficulty}) para ajustar o nível de pressão ou complexidade.`,
            ``,
            `Descreva a situação como se estivesse acontecendo agora e peça que o usuário diga como reagiria.`,
            ``,
            `Apenas a pergunta, sem explicações, aspas ou comentários.`
        ),

        brBuilder(
            `Simule um evento de trabalho para ${userName}, empregado da empresa ${company.name}.`,
            `Detalhes: ${company.description}`,
            `Expectativas: ${expectations}`,
            `Dificuldade: ${company.difficulty}`,
            ``,
            `Crie um desafio típico do ambiente profissional, adequado à dificuldade.`,
            `A situação deve exigir uma decisão prática, não ser uma pergunta de entrevista.`,
            ``,
            `Retorne somente a pergunta, de forma direta.`
        )
    ];

    const easierPrompts = [
        brBuilder(
            `O usuário ${userName} está trabalhando na empresa ${company.name}.`,
            `Seu pet reduziu a complexidade do desafio de hoje 🐾`,
            ``,
            `Crie uma situação mais simples, cotidiana, relacionada ao ambiente descrito:`,
            `Descrição: ${company.description}`,
            `Expectativas: ${expectations}`,
            ``,
            `A dificuldade deve ser reduzida (ex.: um pequeno imprevisto ou tarefa inesperada, não um problema complexo).`,
            ``,
            `Peça que o usuário diga como reagiria, sem explicações adicionais.`
        ),

        brBuilder(
            `Simule um pequeno desafio no dia de trabalho de ${userName} na empresa ${company.name}.`,
            `O pet do usuário está ajudando a tornar as coisas mais fáceis hoje 🐾`,
            ``,
            `Crie uma situação leve, mas ainda plausível para um ambiente profissional com essas características:`,
            `Descrição: ${company.description}`,
            `Expectativas: ${expectations}`,
            ``,
            `A dificuldade deve ser visivelmente menor que ${company.difficulty}, com foco em tarefas rotineiras ou problemas simples.`,
            ``,
            `Apenas a pergunta final, direta e clara.`
        )
    ];

    const pool = hasEasierSkill ? easierPrompts : basePrompts;
    return getRandomValue(pool);
}


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
                cooldowns: true,
                activePet: {
                    include: {
                        skills: { include: { skill: true } },
                        pet: { select: { rarity: true } }
                    }
                }
            }
        })

        if (!user || !user.companyId || !user.company) {
            const commandId = await getCommandId(interaction, "jobs")
            interaction.editReply(res.danger(`${icon.Eris_shy} | Você não tem um emprego! use o comando **</jobs search:${commandId}>** para encontrar um emprego!`))
            return;
        }

        const now = new Date();

        const cooldown = user.cooldowns.find(cooldown => cooldown.name === "work");

        if (cooldown && cooldown.willEndIn > now) {
            interaction.editReply(res.danger(`${icon.denied} | Você já trabalhou hoje. Tente novamente ${time(cooldown.willEndIn, "R")}`));
            return;
        }

        const { company, activePet } = user;

        const hasWorkChallangeAvoid = activePet?.skills.some(s => s.skill.name === "work_challenge_avoid");

        const percentage = hasWorkChallangeAvoid ? 0 : 30 + (user.company.difficulty - 1) * 5;

        if (calculateProbability(percentage)) {
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

            const workChallengeEasier = activePet?.skills.some(s => s.skill.name === "work_challenge_easier");

            const prompt = getWorkChallengePrompt({
                userName: interaction.user.displayName,
                company,
                expectations: companyExpectationsFormatted,
                hasEasierSkill: !!workChallengeEasier
            });


            const result = await generateGeminiContent(prompt);

            if (!result.success || !result.text) {
                await prisma.user.update({
                    where: { id: interaction.user.id },
                    data: { money: { increment: company.wage } }
                });
                interaction.editReply(resv2.danger(`${icon.Eris_cry} | Ocorreu um erro ao gerar o desafio, por isso você recebeu o salário normal de: ${company.wage}`));
                console.error(result.error);

                await Promise.all([
                    registerLog({
                        level: 5,
                        message: `Trabalhou e recebeu seu salário de: **${company.wage}**`,
                        tags: ["economy", "work"],
                        type: "info",
                        user: interaction.user.id
                    }),
                    registerLog({
                        level: 999,
                        message: "Ocorreu um erro ao fazer requisição a api do gemini",
                        tags: ["economy", "work"],
                        type: "error",
                        user: interaction.user.id
                    })
                ])

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
            const workXpBonus = activePet?.skills.find(s => s.skill.name === "work_xp_bonus");
            const workWageBonus = activePet?.skills.find(s => s.skill.name === "work_bonus");

            const petRarity = activePet?.pet.rarity;
            const baseWage = company.wage.toNumber();
            let wage = baseWage;
            let xpGain = Math.floor(Math.random() * (25 - 10 + 1)) + 10; // base de 10 a 25 XP

            // 💰 Bônus de salário
            if (workWageBonus && petRarity) {
                const multiplier = calculateSkillBonus({
                    rarity: petRarity,
                    level: workWageBonus.level
                });

                const newWage = Math.floor(baseWage * multiplier);
                wage = newWage;
            }

            // ⭐ Bônus de XP
            if (workXpBonus && petRarity) {
                const multiplier = calculateSkillBonus({
                    rarity: petRarity,
                    level: workXpBonus.level
                });

                const newXp = Math.floor(xpGain * multiplier);
                xpGain = newXp;
            }

            // Atualizar usuário com valores já bonificados
            const newUser = await prisma.user.update({
                where: { id: interaction.user.id },
                data: {
                    money: { increment: wage },
                    xp: { increment: xpGain }
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

            await registerLog({
                level: 5,
                message: `Trabalhou e recebeu seu salário de: **${company.wage}**`,
                tags: ["economy", "work"],
                type: "info",
                user: interaction.user.id
            });
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