import { ServerSettings } from "#functions";
import { icon } from "functions/utils/index.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, channelMention, ChannelSelectMenuBuilder, ChannelType, SelectMenuDefaultValueType, type InteractionReplyOptions } from "discord.js";

export function dashboardMenu<R>(serverSettings: ServerSettings): R {

    const components = [
        `## ${icon.settings} - Configurações do servidor`,
        createSeparator(),
        brBuilder(
            `${icon.hashtag} - **Canais definidos para o chatbot:**`,
            serverSettings.chatBotChannels.map(channel => channelMention(channel)).join(", ") || "Nenhum canal definido"
        ),
        createRow(
            new ChannelSelectMenuBuilder({
                customId: "dashboard/chatbot/channels",
                placeholder: "Selecione os canais",
                channelTypes: [ChannelType.GuildText],
                defaultValues: serverSettings.chatBotChannels.map(channel => ({
                    type: SelectMenuDefaultValueType.Channel,
                    id: channel,
                })),
                maxValues: 25,
                minValues: 1,
            })
        ),
        createSeparator({ large: true, divider: false }),
        createSection({
            content: serverSettings.chatBotEnabled ? `${icon.toggleon} - **ChatBot:** Habilitado` : `${icon.toggleoff} - **ChatBot:** Desabilitado` + `${serverSettings.chatBotChannels.length === 0 ? "\nDefina algum canal para habilitar o chatbot" : ""}`,
            button: new ButtonBuilder({
                customId: "dashboard/chatbot/enable",
                style: serverSettings.chatBotEnabled ? ButtonStyle.Danger : ButtonStyle.Success,
                label: serverSettings.chatBotEnabled ? "Desabilitar" : "Habilitar",
                disabled: serverSettings.chatBotChannels.length === 0,
            })
        }),
        createSeparator({ large: true, divider: false }),
        brBuilder(
            `${icon.hashtag} - **Canais definidos para desabilitar comandos**`,
            serverSettings.channelsCommandDisabled.map(channel => channelMention(channel)).join(", ") || "Nenhum canal definido"
        ),
        createRow(
            new ChannelSelectMenuBuilder({
                customId: "dashboard/channelsManage/disableChannels",
                placeholder: "Selecione os canais",
                channelTypes: [ChannelType.GuildText],
                defaultValues: serverSettings.channelsCommandDisabled.map(channel => ({
                    type: SelectMenuDefaultValueType.Channel,
                    id: channel,
                })),
                maxValues: 25,
                minValues: 0,
            })
        ),
        createSection({
            content: serverSettings.channelsCommandDisabledIsHabilited ? `${icon.toggleon} - **Canais desabilitados:** Habilitado` : `${icon.toggleoff} - **Canais desabilitados:** Desabilitado` + `${serverSettings.channelsCommandDisabled.length === 0 ? "\nDefina algum canal para habilitar o chatbot" : ""}`,
            button: new ButtonBuilder({
                customId: "dashboard/channelsManage/enableDisableChannels",
                style: serverSettings.channelsCommandDisabledIsHabilited ? ButtonStyle.Danger : ButtonStyle.Success,
                label: serverSettings.channelsCommandDisabledIsHabilited ? "Desabilitar" : "Habilitar",
                disabled: serverSettings.channelsCommandDisabled.length === 0,
            })
        }),
        createSeparator({ large: true, divider: false }),
        brBuilder(
            `${icon.hashtag} - **Canais definidos para poder usar comandos**`,
            serverSettings.channelsCommandEnabled.map(channel => channelMention(channel)).join(", ") || "Nenhum canal definido"
        ),
        createRow(
            new ChannelSelectMenuBuilder({
                customId: "dashboard/channelsManage/onlyChannels",
                placeholder: "Selecione os canais",
                channelTypes: [ChannelType.GuildText],
                defaultValues: serverSettings.channelsCommandEnabled.map(channel => ({
                    type: SelectMenuDefaultValueType.Channel,
                    id: channel,
                })),
                maxValues: 25,
                minValues: 0,
            })
        ),
        createSection({
            content: serverSettings.channelsCommandEnabledIsHabilited ? `${icon.toggleon} - **Canais exclusivos:** Habilitado` : `${icon.toggleoff} - **Canais exclusivos:** Desabilitado` + `${serverSettings.channelsCommandEnabled.length === 0 ? "\nDefina algum canal para habilitar o chatbot" : ""}`,
            button: new ButtonBuilder({
                customId: "dashboard/channelsManage/enableOnlyChannels",
                style: serverSettings.channelsCommandEnabledIsHabilited ? ButtonStyle.Danger : ButtonStyle.Success,
                label: serverSettings.channelsCommandEnabledIsHabilited ? "Desabilitar" : "Habilitar",
                disabled: serverSettings.channelsCommandEnabled.length === 0,
            })
        }),
        "-# Observação: O comando não é bloqueado se o usuário for um administrador."
    ];

    const container = createContainer({
        accentColor: "#4f2499",
        components,
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}