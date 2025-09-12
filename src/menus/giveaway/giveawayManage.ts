import { settings } from "#settings";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { brBuilder, ComponentData, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, channelMention, ChannelSelectMenuBuilder, roleMention, RoleSelectMenuBuilder, SelectMenuDefaultValueType, StringSelectMenuBuilder, time, type InteractionReplyOptions } from "discord.js";

export function giveawayManageMenu<R>(userId: string, data: GiveawayManageDataInfo, page: "main" | "blacklistRoles" | "roleEntries" | "connectedGuilds" | "channelId", giveawayId?: number, guilds: { name: string; id: string }[] = []): R {
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
            data.stayInServerRequire === undefined ? brBuilder(
                `### É necessário estar em todos os servers para participar do sorteio?`,
                data.stayInServerRequire === true ? "Sim" : "Não"
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
                customId: `giveaway/manage/main/${userId}/main/${giveawayId ? giveawayId : "false"}`,
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
                customId: `giveaway/manage/roleSelect/blacklist/${userId}/${giveawayId ? giveawayId : "false"}`,
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
                customId: `giveaway/manage/roleSelect/roleEntries/${userId}/${giveawayId ? giveawayId : "false"}`,
                placeholder: "Cargos para multiplas entradas",
                minValues: 1,
                maxValues: 25,
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/otherRole/roleEntries/${userId}/${giveawayId ? giveawayId : "false"}`,
                label: "Cargos de outros servers",
                style: ButtonStyle.Secondary,
            }),
        )
    )

    page === "connectedGuilds" && rows.push(
        createRow(
            new StringSelectMenuBuilder({
                customId: `giveaway/manage/stringSelect/connectedGuilds/${userId}/${giveawayId ? giveawayId : "false"}`,
                placeholder: "Servidores conectados",
                options: guilds.map(guild => ({
                    label: guild.name,
                    value: guild.id
                }))
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/button/connectedGuilds/${userId}/${giveawayId ? giveawayId : "false"}`,
                label: "Outro",
                style: ButtonStyle.Secondary
            })
        )
    )

    page === "channelId" && rows.push(
        createRow(
            new ChannelSelectMenuBuilder({
                customId: `giveaway/manage/channelSelect/channel/${userId}/${giveawayId ? giveawayId : "false"}`,
                placeholder: "Canal onde ocorrerá o sorteio",
                minValues: 1,
                maxValues: 1,
            })
        )
    )

    page !== "main" && rows.push(
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/back/${userId}/${giveawayId ? giveawayId : "false"}`,
                label: "Voltar",
                style: ButtonStyle.Secondary,
            })
        )
    )

    page === "main" && rows.push(
        createRow(
            new ButtonBuilder({
                customId: `giveaway/manage/start/${userId}/${giveawayId ? giveawayId : "false"}`,
                style: ButtonStyle.Success,
                label: giveawayId ? "Editar" : "Iniciar",
                disabled: !data.winners || !data.channelId || !data.title || !data.expiresAt
            })
        )
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}