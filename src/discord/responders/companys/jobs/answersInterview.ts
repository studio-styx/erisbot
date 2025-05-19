import { createResponder, ResponderType } from "#base";
import { clearInterviewQuestions, getInterviewQuestions, registerLog, updateInterviewAnswer } from "#functions";
import { generateGeminiContent } from "#logic";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { icon, res, resv2 } from "#utils";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";
import i18next from "i18next";

createResponder({
    customId: "company/:userid/interview/:page/:companyId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { userid, page, companyId }) {
        await i18next.changeLanguage(interaction.locale);
        const t = (key: string, options?: any): string => i18next.t(`responders/companys:answersInterviewModal.${key}`, { ...options, lng: interaction.locale }) as string;

        if (userid !== interaction.user.id) {
            interaction.reply(res.danger(t('not_your_command')));
            return;
        }

        interaction.showModal({
            customId: `company/${userid}/modalInterview/${page}/${companyId}`,
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
        return;
    },
});

const prisma = new PrismaClient();

createResponder({
    customId: "company/:userid/modalInterview/:page/:companyId",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction, { userid, page, companyId }) {
        await i18next.changeLanguage(interaction.locale);
        const t = (key: string, options?: any): string => i18next.t(`responders/companys:answersInterview.${key}`, { ...options, lng: interaction.locale }) as string;

        if (userid !== interaction.user.id) {
            interaction.reply(resv2.danger(t('not_your_command')));
            return;
        }

        const response = interaction.fields.getTextInputValue("response");
        const pageNum = parseInt(page);

        // Salva a resposta no cache
        updateInterviewAnswer(userid, companyId, pageNum, response);

        const questions = getInterviewQuestions(userid, companyId) || [{ question: t('question_not_found') }];
        const nextPage = pageNum + 1;

        if (nextPage >= questions.length) {
            await interaction.update(resv2.warning(t('analyzing_responses', { icon: icon.waiting_white }), { components: [] }));

            const allAnswersAndResponses = getInterviewQuestions(userid, companyId)
                ?.map(({ question, answer }) => t('qa_format', { question, answer: answer || t('no_answer') }))
                .join("\n\n") ?? t('no_questions_found');

            interface GeminiResponse {
                contracted: boolean;
                reason: string;
            }
            
            const company = await prisma.company.findUnique({ where: { id: Number(companyId) } });
            
            if (!company) {
                interaction.update(resv2.danger(t('company_not_found', { 
                    icon: icon.error,
                    companyId 
                })));
                await registerLog(
                    t('log.company_not_found', { companyId }),
                    "error",
                    6,
                    userid,
                    "interview"
                );
                return;
            }

            const companyExpectations = (company?.expectations as string[] | { level: number, skill: string }[]);
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
                displayName: interaction.user.displayName,
                companyName: company.name,
                companyDescription: company.description,
                expectations: companyExpectationsFormatted,
                difficulty: company.difficulty,
                qa: allAnswersAndResponses
            });

            try {
                const result = await generateGeminiContent(prompt);
                console.log(prompt);
                console.log(result);
                
                if (!result.success || !result.text) {
                    interaction.editReply(resv2.danger(t('generation_error', { icon: icon.error })));
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
                
                if (!geminiResponse.contracted) {
                    interaction.editReply(resv2.danger(t('rejected', { 
                        icon: icon.denied,
                        reason: geminiResponse.reason 
                    })));
                    await registerLog(
                        t('log.rejected', { reason: geminiResponse.reason }),
                        "warn",
                        3,
                        userid,
                        "interview"
                    );
                    return;
                }

                interaction.editReply(resv2.success(t('hired', {
                    icon: icon.success,
                    reason: geminiResponse.reason
                })));
                
                await prisma.user.update({
                    where: { id: userid },
                    data: { companyId: company.id }
                });
                
                await registerLog(
                    t('log.hired', { companyName: company.name }),
                    "info",
                    10,
                    userid,
                    "interview"
                );
            } catch (error) {
                console.error(error);
                interaction.editReply(resv2.danger(t('unexpected_error', { icon: icon.error })));
                return;
            }

            clearInterviewQuestions(userid, companyId);
            return;
        }

        await interaction.update(resv2.warning(t('next_question_wait', { 
            icon: icon.waiting_white 
        }), { components: [] }));

        await registerLog(
            t('log.answered_question', { page }),
            "debug",
            1,
            interaction.user.id,
            "interview"
        );
        
        setTimeout(async () => {
            await interaction.editReply(menus.jobs.interview(nextPage, userid, companyId));
        }, Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000);
    },
});