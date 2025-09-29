import { settings } from "#settings";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { brBuilder, ComponentData, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, channelMention, ChannelSelectMenuBuilder, ChannelType, roleMention, RoleSelectMenuBuilder, SelectMenuDefaultValueType, StringSelectMenuBuilder, time, type InteractionReplyOptions } from "discord.js";

export function giveawayManageMenu<R>(userId: string, data: GiveawayManageDataInfo, page: "main" | "blacklistRoles" | "roleEntries" | "connectedGuilds" | "channelId", guildsPage: number = 0, guilds: { name: string; id: string }[] = []): R {
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
                data.connectedGuilds.map(guild => `**\`${guild.guildName}\`**`).join(", ")
            ) : null,
            data.stayInServerRequire ? brBuilder(
                `### É necessário estar em todos os servers para participar do sorteio?`,
                data.stayInServerRequire ? "Sim" : "Não"
            ) : null,
            data.winners ? brBuilder(
                `### Quantidade de ganhadores:`,
                data.winners.toString()
            ) : null,
        ),
        createSeparator(),
        `-# Titulo, Expiração, quantidade de ganhadores e canal do sorteio são obrigatórios`
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
                    { label: "Precisa estar em todos os servidores?", description: "É necessário estar em todos os servers para participar do sorteio?", value: "stayInServerRequire" },
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
                defaultValues: data.blackListRoles?.map(roleId => ({
                    id: roleId,
                    type: SelectMenuDefaultValueType.Role
                }))
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
                customId: `giveaway/manage/otherRole/roleEntries/${userId}`,
                label: "Cargos de outros servers",
                style: ButtonStyle.Secondary,
            }),
        )
    )

    const inicial = guildsPage * 25;
    const final = Math.min(inicial + 25, guilds.length);

    page === "connectedGuilds" && rows.push(
        createRow(
            new StringSelectMenuBuilder({
                customId: `giveaway/manage/stringSelect/connectedGuilds/${userId}/${guildsPage}`,
                placeholder: "Servidores conectados",
                options: guilds.slice(inicial, final).map(guild => ({
                    label: guild.name,
                    value: guild.id
                }))
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/button/connectedGuilds/${userId}/${guildsPage - 1}`,
                label: "Anterior",
                style: ButtonStyle.Secondary,
                disabled: guildsPage < 1,
            }),
            new ButtonBuilder({
                customId: `giveaway/manage/clearCache/connectedGuilds/${userId}/${guildsPage - 1}`,
                label: "Limpar cache",
                style: ButtonStyle.Danger,
            }),
            new ButtonBuilder({
                customId: `giveaway/manage/button/connectedGuilds/${userId}/${guildsPage + 2}`,
                label: "Próximo",
                style: ButtonStyle.Secondary,
                disabled: guildsPage === guilds.length - 1,
            }),
        )
    )

    page === "channelId" && rows.push(
        createRow(
            new ChannelSelectMenuBuilder({
                customId: `giveaway/manage/channelSelect/channel/${userId}`,
                placeholder: "Canal onde ocorrerá o sorteio",
                minValues: 1,
                maxValues: 1,
                channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement]
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
                label: data.id ? "Editar" : "Iniciar",
                disabled: !data.winners || !data.channelId || !data.title || !data.expiresAt
            })
        )
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}