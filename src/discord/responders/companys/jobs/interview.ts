import { createResponder, ResponderType, Store } from "#base";
import { generateGeminiContent, getCommandId, getInterviewQuestions, icon, registerLog, resv2, setInterviewQuestions } from "#functions";
import { menus } from "#menus";
import { PrismaClient } from "#prisma";
import { time } from "discord.js";

const prisma = new PrismaClient();

const cooldown = new Store<Date>()

createResponder({
    customId: "companys/interview/:companyId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { companyId }) {
        const userCooldown = cooldown.get(interaction.user.id);
        if (userCooldown) {
            interaction.reply(resv2.danger(`${icon.denied} | você está em cooldown! volte novamente em: ${time(userCooldown, "R")}`));
            return;
        }

        const company = await prisma.company.findUnique({
            where: {
                id: Number(companyId),
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                id: interaction.user.id,
            },
        }) ?? await prisma.user.create({
            data: {
                id: interaction.user.id,
            },
        });

        if (!company) {
            interaction.reply(resv2.danger(`${icon.denied} | Empresa não encontrada!`));
            return;
        }
        if (user.companyId) {
            const commandId = await getCommandId(interaction, "economy")
            interaction.reply(resv2.danger(`${icon.denied} | Você já está empregado! para sair de seu emprego use o comando ${commandId ? `</economy general dismiss:${commandId}>` : "\`/economy general dismiss\`"}`));
            return;
        }
        if (user.xp < company.experience) {
            interaction.reply(resv2.danger(`${icon.denied} | Você não tem experiência suficiente para essa vaga! Você precisa de pelo menos ${company.experience} de experiência.`));
            return;
        }
        await interaction.deferReply()

        await interaction.editReply(resv2.warning(`${icon.waiting_white} | Aguarde enquanto o entrevistador chama a sua vez.`));

        let questions = getInterviewQuestions(interaction.user.id, companyId);

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
            const prompt = `Você é um entrevistador de IA. Você irá entrevistar o candidato \"${interaction.user.displayName}\" para uma vaga na empresa \"${company.name}\".

            Descrição da empresa: ${company.description}

            A empresa espera que seus funcionários tenham os seguintes valores e qualidades:
            ${companyExpectationsFormatted}

            A dificuldade da entrevista é ${company.difficulty}/10 (1 é muito fácil, 10 é extremamente difícil).

            Gere exatamente 5 perguntas relevantes e desafiadoras para essa entrevista, levando em consideração o perfil da empresa e seus valores.
            **Atenção:** se o nivel de dificuldade for 3 ou menos, as perguntas não devem conter perguntas como \"o que você fez\" e sim \"o que você faria\", porém se for superior adeque a dificuldade de acordo com o nível

            Retorne **apenas** um array JSON **no formato exato**: [\"pergunta1\", \"pergunta2\", \"pergunta3\", \"pergunta4\", \"pergunta5\"]
            Sem explicações ou texto adicional, apenas o array JSON.`;

            await registerLog({
                message: `Começou uma entrevista com a empresa ${company.name}`,
                level: 5,
                type: "debug",
                user: interaction.user.id,
                tags: ["interview"]
            });

            try {
                cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 10)), { time: 1000 * 10 };
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
                const rawQuestions: string[] = JSON.parse(text);
                questions = rawQuestions.map((question) => ({ question }));
                setInterviewQuestions(interaction.user.id, companyId, questions);
            } catch (error) {
                console.error(error)
                interaction.editReply(resv2.danger(`${icon.error} | Não foi possível gerar as perguntas, tente novamente mais tarde.`));
                return;
            }
        }

        interaction.editReply(menus.jobs.interview(0, interaction.user.id, companyId));

        cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 20)), { time: 1000 * 60 * 20 };
        return;
    },
});