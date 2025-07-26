import { User } from "#prisma/client";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, SelectMenuDefaultValueType, UserSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function sendMailMenu<R>(users: User[] = [], content?: string, allUsers?: boolean): R {
    const components: any[] = [
        brBuilder(
            "## Enviar carta",
            "**Conteúdo:**"
        ),
        createSeparator(),
        content ? content : "Nenhum definido ainda",
        createSeparator(),
        allUsers ? "**Todos os usuários selecionados**"
            : createRow(
                new UserSelectMenuBuilder({
                    customId: `mail/send/users`,
                    placeholder: "Escolha destinatários",
                    minValues: 1,
                    maxValues: 25,
                    defaultValues: users.map(user => ({
                        id: user.id,
                        type: SelectMenuDefaultValueType.User
                    }))
                })
            ),
        createRow(
            new ButtonBuilder({
                customId: `mail/send/content`,
                label: "Conteúdo",
                style: ButtonStyle.Primary
            })
        )
    ];

    const container = createContainer({
        accentColor: settings.colors.danger,
        components,
    });

    const row = createRow(
        new ButtonBuilder({
            customId: `mail/send/${allUsers ? "sendAllUsers": "send"}`,
            label: "Enviar",
            style: ButtonStyle.Success,
            disabled: users.length === 0
        })
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row]
    } satisfies InteractionReplyOptions) as R;
}