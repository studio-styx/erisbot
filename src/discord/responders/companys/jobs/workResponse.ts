import { createResponder, ResponderType } from "#base";
import { clearCache, generateGeminiContent, getCache, icon, registerLog, res, resv2 } from "#functions";
import { PrismaClient } from "#prisma";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";

const prisma = new PrismaClient();

createResponder({
    customId: "company/work/:userId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { userId }) {
        if (userId !== interaction.user.id) {
            interaction.reply(res.danger(`${icon.Eris_Angry} | Não foi você que executou esse comando!`));
            return;
        }

        const situation: string | null | undefined = getCache(`${interaction.user.id}-situation`);

        if (!situation) {
            interaction.update(res.danger(`${icon.Eris_cry} | Você demorou demais pra responder e a situação já se expirou!`));
            return;
        }

        if (interaction.isButton()) {
            interaction.showModal({
                customId: `company/work/${userId}`,
                title: `Desafio`,
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
            await interaction.editReply(resv2.warning(`${icon.waiting_white} | Aguarde enquanto a ia avalia sua resposta ${icon.Eris_thinking_left}`));

            const user = await prisma.user.findUnique({
                where: {
                    id: interaction.user.id,
                },
                include: {
                    company: true
                }
            })
            if (!user || !user.company) {
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
                                ? `Habilidade: ${expectation.skill}, Nível: ${expectation.level}`
                                : `Não foi possivel formatar essa expectativa`
                        )
                        .join(", ");
                }
            } else {
                companyExpectationsFormatted = `A empresa não tem expectativas definidas.`;
            }

            const prompt = `Avalie a resposta de um funcionário a uma situação simulada de trabalho. Use as informações abaixo para contextualizar a avaliação:\n\nNome da empresa: ${company.name}\n\nDescrição da empresa: ${company.description}\n\nDificuldade do desafio: ${company.difficulty} (1 = muito fácil, 10 = muito difícil)\n\nExpectativas da empresa nos funcionários: ${companyExpectationsFormatted}\n\nSituação simulada: ${situation}\n\nResposta do usuário: ${response}\n\nCom base nesses dados, avalie a resposta do usuário e retorne apenas um objeto JSON com o seguinte formato:\n\n{\n    \"bonus\": 0,\n    \"reason\": \"Explique aqui o motivo da nota, destacando pontos positivos e negativos da resposta.\"\n}\n\nRegras importantes:\n\n    bonus deve ser um número inteiro entre -5 e 5, sem decimais.\n\n    Use valores negativos para respostas ruins, positivos para boas e 0 se for neutra.\n\n    A razão deve ser clara, objetiva e útil para o usuário entender como melhorar.\n\n    Retorne apenas o JSON, sem comentários, sem explicações fora do objeto.`

            interface GeminiResponse {
                bonus: number;
                reason: string;
            }
            const result = await generateGeminiContent(prompt)

            if (!result.success || !result.text) {
                interaction.editReply(resv2.danger(`${icon.error} | ocorreu um erro ao processar sua requisição1`));
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
                interaction.editReply(resv2.danger(`${icon.Eris_cry} | Sua resposta foi insatisfatória, por isso recebeu menos! valor recebido: **Ꞩ ${payValue.toFixed(2)}** \n\n **Avaliação:** ${geminiResponse.reason}`))

                await registerLog({
                    message: `O trabalho do usuário foi ruim, levando **${geminiResponse.bonus}%** de desconto do salário, recebendo: **Ꞩ ${payValue.toFixed(2)}}** de pagamento`,
                    level: 5,
                    type: "warn",
                    user: interaction.user.id,
                    tags: ["work", "job", "sum"]
                })
            } else if (geminiResponse.bonus > 0) {
                interaction.editReply(resv2.success(`${icon.Eris_enchanted} | Sua resposta foi satisfatória, por isso recebeu mais! valor recebido: **Ꞩ ${payValue.toFixed(2)}** \n\n **Avaliação:** ${geminiResponse.reason}`));
                await registerLog({
                    message: `O trabalho do usuário foi bom, levando **${geminiResponse.bonus}%** de bônus do salário, recebendo: **Ꞩ ${payValue.toFixed(2)}}** de pagamento`,
                    level: 5,
                    type: "info",
                    user: interaction.user.id,
                    tags: ["work", "job", "sum"]
                })
            } else {
                interaction.editReply(resv2.primary(`${icon.Eris_enchanted} | Sua resposta foi neutra, por isso recebeu o mesmo salário! valor recebido: **Ꞩ ${payValue.toFixed(2)}** \n\n **Avaliação:** ${geminiResponse.reason}`));
                await registerLog({
                    message: `O trabalho do usuário foi neutra, recebendo: **Ꞩ ${payValue.toFixed(2)}}** de pagamento`,
                    level: 5,
                    type: "info",
                    user: interaction.user.id,
                    tags: ["work", "job", "sum"]
                })
            }
            const xpGain = geminiResponse.bonus < 0
                ? Math.floor(Math.random() * 11) * -1
                : geminiResponse.bonus === 0
                ? Math.floor(Math.random() * 11)
                : Math.floor(Math.random() * 51) + 10; 

            await prisma.user.update({
                where: {
                    id: interaction.user.id
                },
                data: {
                    money: {
                        increment: payValue
                    },
                    xp: {
                        increment: xpGain
                    }
                }
            });

            clearCache(`${userId}-situation`)
        }
        return;
    },
});