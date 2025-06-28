import { ServerSettings } from "#functions";
import { icon } from "#utils";
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
        })
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