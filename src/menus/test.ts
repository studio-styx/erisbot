import { settings } from "#settings";
import { brBuilder, createContainer, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, MessageFlags, type InteractionReplyOptions } from "discord.js";

export function testMenu<R>(): R {
    const components = [
        brBuilder(
            "## test menu"
        ),
        createRow(
            new ButtonBuilder({
                customId: "menu/action",
                label: ">",
                style: ButtonStyle.Success
            })
        )
    ];

    const container = createContainer({
        accentColor: settings.colors.danger,
        components,
    });

    return ({
        flags: ["Ephemeral", MessageFlags.IsComponentsV2],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}