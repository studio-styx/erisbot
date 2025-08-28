import { TryviaQuestions } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function fetchAllQuestionsMenu<R>(questions: TryviaQuestions[], page: number = 0): R {
    const components: any[] = [
        `## Todas Perguntas da Trivia (${questions.length})`
    ]

    const maxPerPage = 8;
    const startIndex = page * maxPerPage;
    const endIndex = startIndex + maxPerPage;
    const pageQuestions = questions.slice(startIndex, endIndex);
    
    pageQuestions.forEach((q, index) => {
        components.push(
            createSection({
                    content: brBuilder(
                    `**${startIndex + index + 1}.** ${q.question}`,
                    "**Resposta:** " + q.correctAnswer,
                    `**ID:** ${q.id} | **Status:** ${q.status} | **Dificuldade:** ${q.difficulty} | **Tags:** [${q.tags.join(", ")}]`,
                ),
                button: new ButtonBuilder({
                    customId: `devMenu/tryvia/edit/${q.id}`,
                    label: "Editar",
                    style: ButtonStyle.Secondary
                })
            })
        );
        if (index < pageQuestions.length - 1) {
            components.push(createSeparator());
        }
    })

    const container = createContainer({
        accentColor: settings.colors.azoxo,
        components: components
    });

    const rows = [
        createRow(
            new ButtonBuilder({
                customId: `devMenu/tryvia/fetchAll/${page - 1}`,
                label: "Página Anterior",
                style: ButtonStyle.Primary,
                disabled: page <= 0
            }),
            new ButtonBuilder({
                customId: `devMenu/tryvia/fetchAll/${page + 1}`,
                label: "Próxima Página",
                style: ButtonStyle.Primary,
                disabled: endIndex >= questions.length
            }),
            new ButtonBuilder({
                customId: "devMenu/tryvia/add",
                label: "Adicionar Perguntas",
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                customId: "devMenu/back/tryvia",
                label: "Voltar",
                style: ButtonStyle.Secondary
            })
        ),
        createRow(
            new StringSelectMenuBuilder({
                customId: "devMenu/tryvia/deleteMany",
                placeholder: "Deletar Perguntas",
                options: pageQuestions.map(q => ({
                    label: q.question.slice(0, 100),
                    description: `ID: ${q.id} | Status: ${q.status} | Dificuldade: ${q.difficulty}`,
                    value: q.id.toString()
                })),
                minValues: 1,
                maxValues: pageQuestions.length
            })
        ),
        
    ]

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}