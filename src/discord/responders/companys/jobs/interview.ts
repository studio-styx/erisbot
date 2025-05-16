import { createResponder, ResponderType } from "#base";
import { registerLog } from "#functions";
import { generateGeminiContent } from "#logic";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { icon, resv2 } from "#utils";
import { getInterviewQuestions, setInterviewQuestions } from "#functions";

const prisma = new PrismaClient();

createResponder({
    customId: "companys/interview/:companyId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { companyId }) {
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
            interaction.reply(resv2.danger(`${icon.error} | não foi possível encontrar essa empresa`));
            return;
        }
        if (user.companyId) {
            interaction.reply(resv2.danger(`${icon.denied} | você já tem um emprego, use \`/economy general dismiss\` para sair do emprego atual`));
            return;
        }
        //if (user.xp < company.experience) {
        //    interaction.reply(resv2.danger(`${icon.denied} | você não tem xp suficiente para trabalhar nessa empresa`));
        //    return;
        //}
        await interaction.deferReply()

        await interaction.editReply(resv2.warning(`${icon.waiting_white} Aguarde enquanto o entrevistador chama a sua vez`));

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
                                ? `habilidade: "${expectation.skill}" level: ${expectation.level}` 
                                : "Expectativa inválida"
                        )
                        .join(", ");
                }
            } else {
                companyExpectationsFormatted = "Expectativas da empresa não foram definidas corretamente.";
            }

        if (!questions) {
            const prompt = `
                Você é um entrevistador de IA. Você irá entrevistar o candidato "${interaction.user.displayName}" para uma vaga na empresa "${company.name}".

                Descrição da empresa: ${company.description}

                A empresa espera que seus funcionários tenham os seguintes valores e qualidades:
                ${companyExpectationsFormatted}

                A dificuldade da entrevista é ${company.difficulty}/10 (1 é muito fácil, 10 é extremamente difícil).

                Gere exatamente 5 perguntas relevantes e desafiadoras para essa entrevista, levando em consideração o perfil da empresa e seus valores.
                **Atenção:** se o nivel de dificuldade for 3 ou menos, as perguntas não devem conter perguntas como "o que você fez" e sim "o que você faria", porém se for superior adeque a dificuldade de acordo com o nível

                Retorne **apenas** um array JSON **no formato exato**: ["pergunta1", "pergunta2", "pergunta3", "pergunta4", "pergunta5"]
                Sem explicações ou texto adicional, apenas o array JSON.
            `;

            await registerLog(
                `começado a entrevista para a empresa: ${company.name}`,
                "info",
                1,
                interaction.user.id,
                "interview"
            );

            try {
                const result = await generateGeminiContent(prompt);
                
                if (!result.success || !result.text) {
                    interaction.editReply(resv2.danger(`${icon.error} | um erro ocorreu ao gerar sua requisição!`));
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
                interaction.editReply(resv2.danger(`${icon.error} | um erro inesperado ocorreu ao gerar sua requisição!`));
                return;
            }
        }

        interaction.editReply(menus.jobs.interview(0, interaction.user.id, companyId));
        return;
    },
});