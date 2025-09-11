import { settings } from "#settings";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { brBuilder, ComponentData, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, channelMention, ChannelSelectMenuBuilder, roleMention, RoleSelectMenuBuilder, StringSelectMenuBuilder, time, type InteractionReplyOptions } from "discord.js";

export function giveawayManageMenu<R>(userId: string, data: GiveawayManageDataInfo, page: "main" | "blacklistRoles" | "roleEntries" | "connectedGuilds" | "channelId", guilds: { name: string; id: string }[] = []): R {
    const components: ComponentData[] = [
        brBuilder(
            "## Gerenciamento de sorteio"
        ),
        createSeparator(),
        brBuilder(
            data.title ? brBuilder(
                `### Título:`,
                data.title
            ) : null,
            data.description ? brBuilder(
                `### Descrição:`,
                data.description
            ) : null,
            data.channelId ? brBuilder(
                `### Canal do sorteio:`,
                channelMention(data.channelId)
            ) : null,
            data.blackListRoles ? brBuilder(
                `### Cargos de BlackList:`,
                data.blackListRoles.map(rb => `**${roleMention(rb)}**`).join(", ")
            ) : null,
            data.xpRequired ? brBuilder(
                `### Xp exigido:`,
                data.xpRequired.toString()
            ) : null,
            data.roleEntries ? brBuilder(
                `### Multiplas entradas:`,
                data.roleEntries.map(role => `**${role.roleName}**. entradas: ${role.entries}`)
            ) : null,
            data.expiresAt ? brBuilder(
                `### Expira em:`,
                time(data.expiresAt, "f")
            ) : null,
            data.connectedGuilds ? brBuilder(
                `### Servers conectados:`,
                data.connectedGuilds.map(guild => `**\`${guild}\`**`).join(", ")
            ) : null,
            data.winners ? brBuilder(
                `### Quantidade de ganhadores:`,
                data.winners.toString()
            ) : null,
        ),
        createSeparator(),
        `-# Titulo, Expiração, quantidade de jogadores e canal do sorteio são obrigatórios`
    ]

    const container = createContainer({
        accentColor: settings.colors.fuchsia,
        components
    });

    const rows: any[] = [
        createRow(
            new StringSelectMenuBuilder({
                customId: `giveaway/manage/main/${userId}/main`,
                placeholder: `Escolha algo para editar`,
                options: [
                    { label: "Título", description: "Título do sorteio", value: "title" },
                    { label: "Descrição", description: "Descrição do sorteio", value: "description" },
                    { label: "Data de expiração", description: "Data de expiração do sorteio", value: "expiresAt" },
                    { label: "Canal de sorteio", description: "Canal de sorteio", value: "channelId" },
                    { label: "Cargos de blacklist", description: "Cargos de blacklist", value: "blacklistRoles" },
                    { label: "Xp exigido", description: "Xp exigido", value: "xpRequired" },
                    { label: "Multiplas entradas", description: "Multiplas entradas", value: "roleEntries" },
                    { label: "Servers conectados", description: "Servers conectados", value: "connectedGuilds" },
                    { label: "Quantidade de ganhadores", description: "Quantidade de ganhadores que podem ganhar o sorteio", value: "winners" },
                ],
                disabled: page !== "main",
            }),
        ),
    ];

    page === "blacklistRoles" && rows.push(
        createRow(
            new RoleSelectMenuBuilder({
                customId: `giveaway/manage/roleSelect/blacklist/${userId}`,
                placeholder: "Cargos para adicionar na blacklist",
                minValues: 1,
                maxValues: 25,
            })
        )
    )

    page === "roleEntries" && rows.push(
        createRow(
            new RoleSelectMenuBuilder({
                customId: `giveaway/manage/roleSelect/roleEntries/${userId}`,
                placeholder: "Cargos para multiplas entradas",
                minValues: 1,
                maxValues: 25,
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/button/roleEntries/${userId}`,
                label: "Cargos de outros servers",
                style: ButtonStyle.Secondary,
            })
        )
    )

    page === "connectedGuilds" && rows.push(
        createRow(
            new StringSelectMenuBuilder({
                customId: `giveaway/manage/stringSelect/connectedGuilds/${userId}`,
                placeholder: "Servidores conectados",
                options: guilds.map(guild => ({
                    label: guild.name,
                    value: guild.id
                }))
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/button/connectedGuilds/${userId}`,
                label: "Outro",
                style: ButtonStyle.Secondary
            })
        )
    )

    page === "channelId" && rows.push(
        createRow(
            new ChannelSelectMenuBuilder({
                customId: `giveaway/manage/channelSelect/channel/${userId}`,
                placeholder: "Canal onde ocorrerá o sorteio",
                minValues: 1,
                maxValues: 1,
            })
        )
    )

    page !== "main" && rows.push(
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/back/${userId}`,
                label: "Voltar",
                style: ButtonStyle.Secondary,
            })
        )
    )

    page === "main" && rows.push(
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/start/${userId}`,
                style: ButtonStyle.Success,
                label: "Iniciar",
                disabled: !data.winners || !data.channelId || !data.title || !data.expiresAt
            })
        )
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}