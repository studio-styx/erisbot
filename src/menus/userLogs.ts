import { res, icon } from "#functions";
import { Log } from "#prisma";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

export function userLogsMenu<R>(allLogs: Log[], page: number = 0, user: { name: string, avatarURL: string, id: string }): R {
    const logsPerPage = 10;
    const startIndex = page * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const logs = allLogs.slice(startIndex, endIndex);

    if (logs.length === 0) {
        return (res.danger(`${icon.error} | nenhum log encontrado`))
    }

    const logsFormated = logs.map((log, index) => {
        return `**${icon.arrow_enter} ${startIndex + index + 1}  -  **(${time(log.timestamp, "d")} | ${time(log.timestamp, "R")}) - ${log.message}`;
    }).join("\n");

    const embed = createEmbed({
        color: settings.colors.success,
        title: "Logs",
        description: logsFormated,
        timestamp: new Date().toISOString(),
        footer: { text: user.name, iconURL: user.avatarURL },
    });

    const row = [
        createRow(
            new ButtonBuilder({
                customId: `user/logs/${page - 1}/${user.id}`,
                label: "Voltar",
                disabled: page === 0,
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                customId: `user/logs/${page + 1}/${user.id}`,
                label: "Avançar",
                disabled: endIndex >= allLogs.length,
                style: ButtonStyle.Primary
            })
        )
    ]

    return ({
        flags: ["Ephemeral"],
        embeds: [embed],
        components: row
    } satisfies InteractionReplyOptions) as R;
}