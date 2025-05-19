import { createResponder, ResponderType } from "#base";
import { clearCache, getCache, registerLog } from "#functions";
import { generateGeminiContent } from "#logic";
import { PrismaClient } from "#prisma/client";
import { icon, resv2, res } from "#utils";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";
import i18next from "i18next";

const prisma = new PrismaClient();

createResponder({
    customId: "company/work/:userId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { userId }) {
        await i18next.changeLanguage(interaction.locale);
        const t = (key: string, options?: any) => i18next.t(`responders/economy:general.work.${key}`, { ...options, lng: interaction.locale }) as string;

        if (userId !== interaction.user.id) {
            interaction.reply(res.danger(t('not_your_command', { icon: icon.denied })));
            return;
        }

        const situation: string | null | undefined = getCache(`${interaction.user.id}-situation`);

        if (!situation) {
            interaction.update(res.danger(t('situation_expired', { icon: icon.denied })));
            return;
        }

        if (interaction.isButton()) {
            interaction.showModal({
                customId: `company/work/${userId}`,
                title: t('modal.title'),
                components: createModalFields({
                    response: {
                        label: t('modal.response_label'),
                        placeholder: t('modal.response_placeholder'),
                        style: TextInputStyle.Paragraph,
                        required: true,
                    },
                }),
            });
        } else {
            const response = interaction.fields.getTextInputValue("response");

            await interaction.deferUpdate();
            await interaction.editReply(resv2.warning(t('analyzing_response', { icon: icon.waiting_white })));

            const user = await prisma.user.findUnique({
                where: {
                    id: interaction.user.id,
                },
                include: {
                    company: true
                }
            })
            if (!user) {
                interaction.editReply(resv2.danger(t('user_not_found', { icon: icon.error })));
                return;
            }
            if (!user.company) {
                interaction.editReply(resv2.danger(t('no_company_error', { icon: icon.error })));
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
                                ? t('expectation_format', { skill: expectation.skill, level: expectation.level })
                                : t('invalid_expectation')
                        )
                        .join(", ");
                }
            } else {
                companyExpectationsFormatted = t('invalid_company_expectations');
            }

            const prompt = t('evaluation_prompt', {
                companyName: company.name,
                companyDescription: company.description || t('no_description'),
                difficulty: company.difficulty,
                expectations: companyExpectationsFormatted,
                situation,
                response
            });

            interface GeminiResponse {
                bonus: number;
                reason: string;
            }
            const result = await generateGeminiContent(prompt)

            if (!result.success || !result.text) {
                interaction.editReply(resv2.danger(t('evaluation_error', { icon: icon.error })));
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
                interaction.editReply(resv2.danger(t('negative_bonus_response', {
                    icon: icon.error,
                    payValue,
                    reason: geminiResponse.reason
                })));

                await registerLog(
                    t('log.negative_bonus', { bonus: geminiResponse.bonus * 10, payValue }),
                    "info",
                    5,
                    interaction.user.id,
                    "work"
                )
            } else if (geminiResponse.bonus > 0) {
                interaction.editReply(resv2.success(t('positive_bonus_response', {
                    icon: icon.success,
                    payValue,
                    reason: geminiResponse.reason
                })));
                await registerLog(
                    t('log.positive_bonus', { bonus: geminiResponse.bonus * 10, payValue }),
                    "info",
                    5,
                    interaction.user.id,
                    "work"
                )
            } else {
                interaction.editReply(resv2.primary(t('neutral_bonus_response', {
                    icon: icon.success,
                    payValue,
                    reason: geminiResponse.reason
                })));
                await registerLog(
                    t('log.neutral_bonus', { payValue }),
                    "info",
                    5,
                    interaction.user.id,
                    "work"
                )
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