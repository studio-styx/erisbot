import { User } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function ignoreTagMenu<R>(user: User): R {
    const selectMenu1Values = user.mailsTagsIgnored.slice(0, 25);
    const selectMenu2Values = user.mailsTagsIgnored.slice(25, (25 * 2));

    if (selectMenu1Values.length === 0) {
        const components = [
            brBuilder(
                "## Você não tem tags ignoradas"
            ),
        ];

        const rows = [
            createRow(
                new ButtonBuilder({
                    customId: `mail/menu/main/${user.id}`,
                    label: "Retornar",
                    style: ButtonStyle.Success
                })
            )
        ]

        const container = createContainer({
            accentColor: settings.colors.success,
            components,
        });

        return ({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container, ...rows]
        } satisfies InteractionReplyOptions) as R;
    }

    const components = [
        brBuilder(
            "# Tags ignoradas"
        ),
        createRow(
            new StringSelectMenuBuilder({
                customId: `mail/action/unIgnoretag1/${user.id}/0`,
                placeholder: "Selecione as tags para deixar de ignora-las",
                minValues: 0,
                maxValues: selectMenu1Values.length,
                options: selectMenu1Values.map(t => ({
                    label: t,
                    value: t
                }))
            })
        )
    ];

    if (selectMenu2Values.length > 0) {
        components.push(
            createRow(
                new StringSelectMenuBuilder({
                    customId: `mail/action/unIgnoretag2/${user.id}/0`,
                    placeholder: "Selecione as tags para deixar de ignora-las",
                    minValues: 0,
                    maxValues: selectMenu2Values.length,
                    options: selectMenu2Values.map(t => ({
                        label: t,
                        value: t
                    }))
                })
            )
        )
    }

    const rows = [
        createRow(
            new ButtonBuilder({
                customId: `mail/menu/main/${user.id}`,
                label: "Retornar",
                style: ButtonStyle.Success
            })
        )
    ]

    const container = createContainer({
        accentColor: settings.colors.success,
        components,
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}