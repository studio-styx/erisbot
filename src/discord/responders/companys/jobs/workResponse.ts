import { createResponder, ResponderType } from "#base";
import { clearCache, getCache, registerLog } from "#functions";
import { generateGeminiContent } from "#logic";
import { PrismaClient } from "#prisma/client";
import { icon, resv2, res } from "#utils";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";

const prisma = new PrismaClient();

createResponder({
    customId: "company/work/:userId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { userId }) {
        if (userId !== interaction.user.id) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando`));
            return;
        }

        const situation: string | null | undefined = getCache(`${interaction.user.id}-situation`);

        if (!situation) {
            interaction.update(res.danger(`${icon.denied} | ops, parece que você demorou demais para responder e a situação foi deletada do cache! (ou já foi respondida)`));
            return;
        }

        if (interaction.isButton()) {
            interaction.showModal({
                customId: `company/work/${userId}`,
                title: "Desafio",
                components: createModalFields({
                    response: {
                        label: "Resposta para o desafio",
                        placeholder: "Responda o desafio aqui",
                        style: TextInputStyle.Paragraph,
                        required: true,
                    },
                }),
            });
        } else {
            const response = interaction.fields.getTextInputValue("response");

            await interaction.deferUpdate();
            await interaction.editReply(resv2.warning(`${icon.waiting_white} Aguarde enquanto a IA analisa sua resposta.`));

            const user = await prisma.user.findUnique({
                where: {
                    id: interaction.user.id,
                },
                include: {
                    company: true
                }
            })
            if (!user) {
                interaction.editReply(resv2.danger(`${icon.error} | Não foi possível encontrar você no banco de dados`));
                return;
            }
            if (!user.company) {
                interaction.editReply(resv2.danger(`${icon.error} | Você não trabalha em nenhuma empresa!`));
                return;
            }

            const { company } = user;

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


            const prompt = `
                Avalie a resposta de um funcionário a uma situação simulada de trabalho. Use as informações abaixo para contextualizar a avaliação:

                    Nome da empresa: ${company.name}

                    Descrição da empresa: ${company.description || "Nenhuma descrição definida"}

                    Dificuldade do desafio: ${company.difficulty} (1 = muito fácil, 10 = muito difícil)

                    Expectativas da empresa nos funcionários: ${companyExpectationsFormatted}

                    Situação simulada: ${situation}

                    Resposta do usuário: ${response}

                Com base nesses dados, avalie a resposta do usuário e retorne apenas um objeto JSON com o seguinte formato:

                {
                    "bonus": 0,
                    "reason": "Explique aqui o motivo da nota, destacando pontos positivos e negativos da resposta."
                }

                Regras importantes:

                    bonus deve ser um número inteiro entre -5 e 5, sem decimais.

                    Use valores negativos para respostas ruins, positivos para boas e 0 se for neutra.

                    A razão deve ser clara, objetiva e útil para o usuário entender como melhorar.

                    Retorne apenas o JSON, sem comentários, sem explicações fora do objeto.
            `
            interface GeminiResponse {
                bonus: number;
                reason: string;
            }
            const result = await generateGeminiContent(prompt)

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

            const geminiResponse: GeminiResponse = JSON.parse(text);

            const bonus = geminiResponse.bonus;
            const wage = company.wage.toNumber();

            const payValue = wage * (1 + 0.1 * bonus);


            if (geminiResponse.bonus < 0) {
                interaction.editReply(resv2.danger(`${icon.error} | Sua resposta foi insatisfatória, por isso recebeu menos! valor recebido: **Ꞩ ${payValue}** \n\n **Avaliação:** ${geminiResponse.reason}`));

                await registerLog(
                    `O trabalho do usuário foi ruim, levando **${geminiResponse.bonus * 10}%** de desconto do salário, recebendo: **Ꞩ ${payValue}** de pagamento`,
                    "info",
                    5,
                    interaction.user.id,
                    "work"
                )
            } else if (geminiResponse.bonus > 0) {
                interaction.editReply(resv2.success(`${icon.success} | Sua resposta foi satisfatória, por isso recebeu mais! valor recebido: **Ꞩ ${payValue}** \n\n **Avaliação:** ${geminiResponse.reason}`));
                await registerLog(
                    `O trabalho do usuário foi bom, levando **${geminiResponse.bonus * 10}%** de aumento do salário, recebendo: **Ꞩ ${payValue}** de pagamento`,
                    "info",
                    5,
                    interaction.user.id,
                    "work"
                )
            } else {
                interaction.editReply(resv2.primary(`${icon.success} | Sua resposta foi neutra, por isso recebeu o salário normal! valor recebido: **Ꞩ ${payValue}** \n\n **Avaliação:** ${geminiResponse.reason}`));
                await registerLog(
                    `O trabalho do usuário foi neutro, recebendo: **Ꞩ ${payValue}** de pagamento`,
                    "info",
                    5,
                    interaction.user.id,
                    "work"
                )
            }
            await prisma.user.update({
                where: {
                    id: interaction.user.id
                },
                data: {
                    money: {
                        increment: payValue
                    }
                }
            })

            clearCache(`${userId}-situation`)
        }
        return;
    },
});