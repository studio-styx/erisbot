import { settings } from "#settings";
import { brBuilder, createContainer, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function giveawayEndMenuMenu<R>(ownerId: string, winnersIds: string[]): R {
    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            "## giveawayEndMenu menu"
        ),
        createRow(
            new ButtonBuilder({
                customId: "menu/action",
                label: ">",
                style: ButtonStyle.Success
            })
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}