import { settings } from "#settings";
import { createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";
import { getInterviewQuestions } from "#functions";

export function interviewMenu<R>(page: number, userid: string, companyId: string): R {
    const questions = getInterviewQuestions(userid, companyId) || [{ question: "Não encontrado" }];
    const components = [
        page === 0
            ? "**Entrevista iniciada com sucesso! responda a pergunta abaixo clicando no botão de responder**"
            : "**Responda a pergunta abaixo clicando no botão de responder**",
        createSeparator(),
        questions[page]?.question,
        createRow(
            new ButtonBuilder({
                customId: `company/${userid}/interview/${page}/${companyId}`,
                label: "responder",
                style: ButtonStyle.Primary,
            })
        ),
        `\n-# Pergunta ${page + 1}/5`
    ];

    const container = createContainer({
        accentColor: settings.colors.primary,
        components,
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}