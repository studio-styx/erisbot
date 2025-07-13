import { createResponder, ResponderType, Store } from "#base";
import { registerLog } from "#functions";
import { generateGeminiContent } from "functions/logic/index.js";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { icon, resv2 } from "functions/utils/index.js";
import { getInterviewQuestions, setInterviewQuestions } from "#functions";
import i18next from "i18next";
import { time } from "discord.js";

const prisma = new PrismaClient();

const cooldown = new Store<Date>()

createResponder({
    customId: "companys/interview/:companyId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { companyId }) {
        await i18next.changeLanguage(interaction.locale);
        const t = (key: string, options?: any): string => i18next.t(`responders/companys:interview.${key}`, { ...options, lng: interaction.locale }) as string;
        
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
            interaction.reply(resv2.danger(t('company_not_found', { icon: icon.error })));
            return;
        }
        if (user.companyId) {
            interaction.reply(resv2.danger(t('already_employed', { 
                icon: icon.denied,
                command: '/economy general dismiss'
            })));
            return;
        }
        if (user.xp < company.experience) {
            interaction.reply(resv2.danger(t('insufficient_xp', { icon: icon.denied })));
            return;
        }
        await interaction.deferReply()

        await interaction.editReply(resv2.warning(t('waiting_interviewer', { icon: icon.waiting_white })));

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
                            ? t('expectation_format', { skill: expectation.skill, level: expectation.level })
                            : t('invalid_expectation')
                    )
                    .join(", ");
            }
        } else {
            companyExpectationsFormatted = t('invalid_company_expectations');
        }

        if (!questions) {
            const prompt = t('interview_prompt', {
                displayName: interaction.user.displayName,
                companyName: company.name,
                companyDescription: company.description,
                expectations: companyExpectationsFormatted,
                difficulty: company.difficulty
            });

            await registerLog(
                t('log.interview_started', { companyName: company.name }),
                "info",
                1,
                interaction.user.id,
                "interview"
            );

            try {
                cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 10)), { time: 1000 * 10 };
                const result = await generateGeminiContent(prompt);
                
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
                const rawQuestions: string[] = JSON.parse(text);
                questions = rawQuestions.map((question) => ({ question }));
                setInterviewQuestions(interaction.user.id, companyId, questions);
            } catch (error) {
                console.error(error)
                interaction.editReply(resv2.danger(t('unexpected_error', { icon: icon.error })));
                return;
            }
        }

        interaction.editReply(menus.jobs.interview(0, interaction.user.id, companyId));

        cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 20)), { time: 1000 * 60 * 20 };
        return;
    },
});