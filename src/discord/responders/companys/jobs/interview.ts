import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { generateGeminiContent, getCommandId, getInterviewCooldown, getInterviewQuestions, icon, registerLog, resv2, setInterviewCooldown, setInterviewQuestions } from "#functions";
import { menus } from "#menus";
import { brBuilder } from "@magicyan/discord";
import { time } from "discord.js";

const simpleCooldown = new Store<Date>()

createResponder({
    customId: "companys/interview/:companyId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { companyId }) {
        if (simpleCooldown.has(interaction.user.id)) {
            interaction.reply(resv2.danger(`${icon.denied} | Você está em cooldown! volte novamente em: ${time(simpleCooldown.get(interaction.user.id)!, "R")} ou termine sua entrevista atual.`));
            return;
        }
        const userCooldown = await getInterviewCooldown(interaction.user.id);
        if (userCooldown) {
            const endTimestamp = Date.now() + userCooldown;
            const endTimestampSeconds = Math.floor(endTimestamp / 1000); // Converter para segundos e arredondar para baixo
            interaction.reply(resv2.danger(`${icon.denied} | você está em cooldown! volte novamente ${time(endTimestampSeconds, "R")}`));
            return;
        }

        simpleCooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 10), {
            time: 1000 * 10
        })
        await interaction.deferReply()

        const company = await prisma.company.findUnique({
            where: {
                id: Number(companyId),
                isEnabled: true
            },
        });
        
        if (!company) {
            interaction.editReply(resv2.danger(`${icon.denied} | Empresa não encontrada!`));
            return;
        }

        const user = await prisma.user.upsert({
            where: {
                id: interaction.user.id
            },
            update: {},
            create: {
                id: interaction.user.id
            },
            include: {
                activePet: {
                    include: {
                        pet: true,
                        skills: {
                            include: {
                                skill: true
                            }
                        }
                    }
                }
            }
        })

        if (user.companyId) {
            const commandId = await getCommandId(interaction, "jobs")
            interaction.editReply(resv2.danger(`${icon.denied} | Você já está empregado! para sair de seu emprego use o comando ${commandId ? `</jobs dismiss:${commandId}>` : "\`/economy general dismiss\`"}`));
            return;
        }
        if (user.xp < company.experience) {
            interaction.editReply(resv2.danger(`${icon.denied} | Você não tem experiência suficiente para essa vaga! Você precisa de pelo menos ${company.experience} de experiência.`));
            return;
        }

        if (company.flags.includes("NO_INTERVIEW")) {
            await prisma.user.update({
                where: { id: interaction.user.id },
                data: { companyId: company.id }
            });
            interaction.editReply(resv2.success(`${icon.success} | Esta empresa não requer entrevista. Você foi contratado automaticamente!`));
            return;
        }

        await interaction.editReply(resv2.warning(`${icon.waiting_white} | Aguarde enquanto o entrevistador chama a sua vez.`));

        let questions = await getInterviewQuestions(interaction.user.id, companyId);

        const companyExpectations = (company?.expectations as string[] | { level: number, skill: string }[])

        let companyExpectationsFormatted: string;

        if (Array.isArray(companyExpectations)) {
            if (typeof companyExpectations[0] === "string") {
                companyExpectationsFormatted = companyExpectations.join(", ").replace(/, ([^,]*)$/, " e $1");
            } else {
                companyExpectationsFormatted = companyExpectations
                    .map((expectation) =>
                        typeof expectation === "object" && "skill" in expectation
                            ? `Habilidade: ${expectation.skill}, Nível: ${expectation.level}`
                            : "Expectativa inválida"
                    )
                    .join(", ");
            }
        } else {
            companyExpectationsFormatted = "Nenhuma expectativa definida";
        }

        if (!questions) {
            const interviewEasier: boolean = !!user.activePet?.skills.some(s => s.skill.name === "job_interview_easier");

            const prompt: string = interviewEasier
                ? brBuilder(
                    `Você é um entrevistador de IA. Você irá entrevistar o candidato "${interaction.user.displayName}" para uma vaga na empresa "${company.name}".`,
                    `Descrição da empresa: ${company.description}`,
                    company.flags.length > 0 ? `Flags da empresa (importante): ${company.flags.join(", ")}` : "",
                    `A empresa espera que seus funcionários tenham os seguintes valores e qualidades: ${companyExpectationsFormatted}`,
                    `A dificuldade da entrevista deve ser ajustada para ser mais fácil, pois o candidato possui a habilidade "job_interview_easier".`,
                    `Gere exatamente 5 perguntas simples e relevantes para essa entrevista, levando em consideração o perfil da empresa e seus valores.`,
                    `**Atenção:** as perguntas devem ser do tipo "o que você faria" e não "o que você fez", para manter a entrevista acessível.`,
                    `Retorne **apenas** um array JSON **no formato exato**: ["pergunta1", "pergunta2", "pergunta3", "pergunta4", "pergunta5"]`,
                    `Sem explicações ou texto adicional, apenas o array JSON.`
                )
                : brBuilder(
                    `Você é um entrevistador de IA. Você irá entrevistar o candidato "${interaction.user.displayName}" para uma vaga na empresa "${company.name}".`,
                    `Descrição da empresa: ${company.description}`,
                    company.flags.length > 0 ? `Flags da empresa (importante): ${company.flags.join(", ")}` : "",
                    `A empresa espera que seus funcionários tenham os seguintes valores e qualidades: ${companyExpectationsFormatted}`,
                    `A dificuldade da entrevista é ${company.difficulty}/10 (1 é muito fácil, 10 é extremamente difícil).`,
                    `Gere exatamente 5 perguntas relevantes e desafiadoras para essa entrevista, levando em consideração o perfil da empresa e seus valores.`,
                    `**Atenção:** se o nível de dificuldade for 3 ou menos, as perguntas não devem conter perguntas como "o que você fez" e sim "o que você faria". Para dificuldades superiores, adeque a dificuldade de acordo com o nível.`,
                    `Retorne **apenas** um array JSON **no formato exato**: ["pergunta1", "pergunta2", "pergunta3", "pergunta4", "pergunta5"]`,
                    `Sem explicações ou texto adicional, apenas o array JSON.`
                );

            await registerLog({
                message: `Começou uma entrevista com a empresa ${company.name}`,
                level: 5,
                type: "debug",
                user: interaction.user.id,
                tags: ["interview"]
            });

            try {
                const result = await generateGeminiContent(prompt);

                if (!result.success || !result.text) {
                    interaction.editReply(resv2.danger(`${icon.denied} | Não foi possível gerar as perguntas, tente novamente mais tarde.`));
                    console.error(result);
                    return;
                }
                let text = result.text.trim();

                // Remove bloco de código se existir
                if (text.startsWith("```json")) {
                    text = text.slice(7);
                }
                if (text.startsWith("```")) {
                    text = text.slice(3);
                }
                if (text.endsWith("```")) {
                    text = text.slice(0, -3);
                }
                const rawQuestions: string[] = JSON.parse(text) as string[];
                questions = rawQuestions.map((question) => ({ question }));
                await setInterviewQuestions(interaction.user.id, companyId, questions);

                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(error)
                interaction.editReply(resv2.danger(`${icon.error} | Não foi possível gerar as perguntas, tente novamente mais tarde.`));
                return;
            }
        }

        // Verificar novamente se as perguntas foram carregadas
        const currentQuestions = await getInterviewQuestions(interaction.user.id, companyId);
        if (!currentQuestions || currentQuestions.length === 0) {
            interaction.editReply(resv2.danger(`${icon.error} | Erro ao carregar as perguntas.`));
            return;
        }

        interaction.editReply(await menus.jobs.interview(0, interaction.user.id, companyId));
        await setInterviewCooldown(interaction.user.id);
        return;
    },
});
