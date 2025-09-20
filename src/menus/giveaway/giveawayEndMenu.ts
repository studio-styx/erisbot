import { formatElapsedTime, icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createContainer, createSeparator } from "@magicyan/discord";
import { userMention, type InteractionReplyOptions } from "discord.js";

export function giveawayEndMenu<R>(winnersIds: string[], info: {
    title: string;
    description: string | null;
    expiresAt: Date;
    createdAt: Date;
}): R {
    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            "# Fim de sorteio",
            `O sorteio: **${info.title}** foi finalizado! ele durou por: \`${formatElapsedTime(info.createdAt, new Date())}\``
        ),
        createSeparator(),
        brBuilder(
            `## Ganhadores:`,
            winnersIds.map(w => `${icon.arrow_enter} ${userMention(w)}`)
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container],
        allowedMentions: { parse: [] }
    } satisfies InteractionReplyOptions) as R;
}