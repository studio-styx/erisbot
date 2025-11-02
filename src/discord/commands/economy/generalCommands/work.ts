import { Store } from "#base";
import { prisma } from "#database";
import { res, getCache, getCommandId, resv2, generateGeminiContent, registerLog, setCache, calculateProbability, getRandomValue, ErisError } from "#functions";
import { getLang, LangCode, translate } from "#locale";
import { Company, Rarity } from "#prisma";
import { settings } from "#settings";
import { createContainer, brBuilder, createSeparator, createTextDisplay, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";

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

function getWorkChallengePrompt({ userName, company, expectations, hasEasierSkill, lang }: { userName: string, company: Company, expectations: string, hasEasierSkill: boolean, lang: LangCode }) {
    const langPrompt = lang === "enus"
        ? "O prompt está todo em português, mas você deve retornar o conteúdo em INGLÊS, sem nenhuma palavra em algum idioma diferente"
        : lang === "eses"
            ? "O prompt está todo em português, mas você deve retornar o conteúdo em ESPANHOL, sem nenhuma palavra em algum idioma diferente"
            : "Responda em português:"

    const basePrompts = [
        brBuilder(
            `${langPrompt}`,
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
    const lang = getLang(interaction.locale);
    const t = translate.commands.work[lang];

    if (cooldowns.has(interaction.user.id)) {
        interaction.reply(res.danger(t.iaIsGenerating));
        return;
    }

    const situation: string | null | undefined = getCache(`${interaction.user.id}-situation`);

    if (situation) throw new ErisError(t.alreadyAsInASituation, false);
    await interaction.deferReply();

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
        throw new ErisError(t.doNotHaveWork(commandId), false)
    }

    const now = new Date();

    const cooldown = user.cooldowns.find(cooldown => cooldown.name === "work");

    if (cooldown && cooldown.willEndIn > now) throw new ErisError(t.cooldown(cooldown.willEndIn), false);

    const { company, activePet } = user;

    const hasWorkChallangeAvoid = activePet?.skills.some(s => s.skill.name === "work_challenge_avoid");

    const percentage = company.flags.includes("100%_SITUATION") ? 100
        : company.flags.includes("NO_SITUATION") ? 0
            : hasWorkChallangeAvoid ? 0 : 30 + (user.company.difficulty - 1) * 5;

    if (calculateProbability(percentage)) {
        cooldowns.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 4), { time: 1000 * 60 * 4 });
        await interaction.editReply(resv2.warning(t.situationOccured));

        const companyExpectations = (company?.expectations as string[] | { level: number, skill: string }[]);
        const companyExpectationsFormatted = t.expectationsFormatted(companyExpectations);

        const workChallengeEasier = activePet?.skills.some(s => s.skill.name === "work_challenge_easier");

        const prompt = getWorkChallengePrompt({
            userName: interaction.user.displayName,
            company,
            expectations: companyExpectationsFormatted,
            hasEasierSkill: !!workChallengeEasier,
            lang
        });


        const result = await generateGeminiContent(prompt);

        if (!result.success || !result.text) {
            await prisma.user.update({
                where: { id: interaction.user.id },
                data: { money: { increment: company.wage } }
            });
            interaction.editReply(resv2.danger(t.apiErrorMessage(company.wage.toNumber())));
            console.error(result.error);

            await Promise.all([
                registerLog({
                    level: 5,
                    message: t.log(company.wage.toNumber()),
                    tags: ["economy", "work"],
                    type: "info",
                    user: interaction.user.id
                }),
                registerLog({
                    level: 999,
                    message: t.logApiError,
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
                t.situation.container.title,
                createSeparator(),
                createTextDisplay(response, 1),
                createRow(
                    new ButtonBuilder({
                        customId: `company/work/${interaction.user.id}`,
                        label: t.situation.container.button,
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
                    components: [t.message(newUser.money.toNumber(), newUser.xp, wage)]
                })
            ]
        });

        await registerLog({
            level: 5,
            message: t.log(wage),
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
}