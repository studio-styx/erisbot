import { icon } from "#functions";
import { Giveaway, GuildGiveaway, RoleMultipleEntry, UserGiveaway } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, roleMention, time, type InteractionReplyOptions } from "discord.js";

export function giveawayInterfaceMenu<R>(data: (Giveaway & { roleEntries: (RoleMultipleEntry & { roleName: string })[], connectedGuilds: (GuildGiveaway & { guildName: string })[], participants: UserGiveaway[] }), guildId: string): R {
    const guildInfo = data.connectedGuilds.find(g => g.guildId === guildId)!;

    const container = createContainer(settings.colors.fuchsia,
        `${icon.confetti} | **Sorteio ${data.localId}**`,
        `## ${data.title}`,
        createSeparator(),
        data.description && data.description,
        data.description && createSeparator(),
        (data.roleEntries.length > 1 && data.connectedGuilds.length > 1) ? brBuilder(
            data.roleEntries.length > 0 ? brBuilder(
                `${icon.ticket2x} - Cargos que ganham multiplas entradas:`,
                data.roleEntries.map(r => `**${r.roleName} - ${r.extraEntries}**`)
            ) : null,
            data.connectedGuilds.length > 1 ? brBuilder(
                `${icon.connect_guilds} - Servidores que estão conectados ao sorteio: **(${data.connectedGuilds.length})**`,
                data.connectedGuilds.map(g => `**${g.guildName}**`).join(", ")
            ) : null,
        ) : false,
        (data.roleEntries.length > 1 && data.connectedGuilds.length > 1) ? createSeparator() : false,
        (guildInfo.blackListRoles.length > 0 && guildInfo.xpRequired) ? brBuilder(
            guildInfo.blackListRoles.length > 0 ? brBuilder(
                `${icon.blacklist} - Cargos de blacklist:`,
                guildInfo.blackListRoles.map(rb => `**${roleMention(rb)}**`)
            ) : null,
            guildInfo.xpRequired ? brBuilder(
                `${icon.info} - Xp exigido:`,
                guildInfo.xpRequired.toString()
            ) : null,
        ) : false,
        (guildInfo.blackListRoles.length > 0 && guildInfo.xpRequired) ? createSeparator() : false,
        `${icon.alarm} - Sorteio termina ${time(data.expiresAt, "R")}`
    );

    const row = createRow(
        new ButtonBuilder({
            customId: `giveaway/entry/${data.id}`,
            label: `Entrar (${data.participants.length})`,
            style: ButtonStyle.Success,
        })
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row]
    } satisfies InteractionReplyOptions) as R;
}