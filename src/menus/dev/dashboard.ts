import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function devDashboardMenu<R>(stage?: string): R {
    switch (stage) {
        case "tryvia": {
            const container = createContainer(settings.colors.azoxo,
                brBuilder(
                    "## Gerenciador de Trivia"
                ),
                brBuilder(
                    "Aqui você pode gerenciar as perguntas da trivia."
                ),
                createSeparator(),
                createRow(
                    new ButtonBuilder({
                        customId: "devMenu/tryvia/fetchAll/0",
                        label: "Listar Todas Perguntas",
                        style: ButtonStyle.Primary
                    }),
                    new ButtonBuilder({
                        customId: "devMenu/tryvia/fetchPending/0",
                        label: "Listar Perguntas Pendentes",
                        style: ButtonStyle.Primary
                    }),
                    new ButtonBuilder({
                        customId: "devMenu/tryvia/add",
                        label: "Adicionar Perguntas",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "devMenu/back/main",
                        label: "Voltar",
                        style: ButtonStyle.Secondary
                    })
                )
            );

            return ({
                flags: ["Ephemeral", "IsComponentsV2"],
                components: [container]
            } satisfies InteractionReplyOptions) as R;
        }
        default: {
            const container = createContainer(settings.colors.azoxo,
                brBuilder(
                    "## Dev Menu"
                ),
                brBuilder(
                    "Olá desenvolvedor! Aqui estão algumas ferramentas úteis para você."
                ),
                createSeparator(),
                createRow(
                    new ButtonBuilder({
                        customId: "devMenu/tryvia",
                        label: "Gerenciar Trivia",
                        style: ButtonStyle.Secondary
                    })
                )
            );
        
            return ({
                flags: ["Ephemeral", "IsComponentsV2"],
                components: [container]
            } satisfies InteractionReplyOptions) as R;
        }
    }
}