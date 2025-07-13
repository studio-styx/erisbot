import { createResponder, ResponderType } from "#base";
import { getServerSettings, setServerSettings } from "#functions";
import { menus } from "#menus";
import { PrismaClient } from "#prisma";

const prisma = new PrismaClient();

createResponder({
    customId: "dashboard/chatbot/:action",
    types: [ResponderType.ChannelSelect, ResponderType.Button], cache: "cached",
    async run(interaction, { action }) {
        switch (action) {
            case "channels": {
                if (!interaction.isChannelSelectMenu()) return;
                
                const channels = interaction.values;
                let serverSettings = getServerSettings(interaction.guildId);

                if (!serverSettings) {
                    serverSettings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } }) || {
                        chatBotChannels: [],
                        chatBotEnabled: false,
                        channelsCommandDisabled: [],
                        channelsCommandEnabled: [],
                        channelsCommandDisabledIsHabilited: false,
                        channelsCommandEnabledIsHabilited: false,
                    }
                }

                const newSS = setServerSettings(interaction.guildId, {
                    chatBotChannels: channels,
                    chatBotEnabled: serverSettings?.chatBotEnabled || false,
                    channelsCommandDisabled: serverSettings?.channelsCommandDisabled || [],
                    channelsCommandEnabled: serverSettings?.channelsCommandEnabled || [],
                    channelsCommandDisabledIsHabilited: serverSettings?.channelsCommandDisabledIsHabilited || false,
                    channelsCommandEnabledIsHabilited: serverSettings?.channelsCommandEnabledIsHabilited || false,
                });

                await prisma.guildSettings.upsert({
                    where: { id: interaction.guildId },
                    update: { chatBotChannels: channels },
                    create: { id: interaction.guildId, chatBotChannels: channels },
                });

                interaction.update(menus.settings.dashboard(newSS));
                return;
            }
            case "enable": {
                if (!interaction.isButton()) return;

                let serverSettings = getServerSettings(interaction.guildId);
                if (!serverSettings) {
                    serverSettings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } }) || {
                        chatBotChannels: [],
                        chatBotEnabled: false,
                        channelsCommandDisabled: [],
                        channelsCommandEnabled: [],
                        channelsCommandDisabledIsHabilited: false,
                        channelsCommandEnabledIsHabilited: false,
                    }
                }

                if (serverSettings.chatBotEnabled) {
                    const newSS = setServerSettings(interaction.guildId, {
                        chatBotChannels: serverSettings.chatBotChannels,
                        chatBotEnabled: false,
                        channelsCommandDisabled: serverSettings.channelsCommandDisabled,
                        channelsCommandEnabled: serverSettings.channelsCommandEnabled,
                        channelsCommandDisabledIsHabilited: serverSettings.channelsCommandDisabledIsHabilited,
                        channelsCommandEnabledIsHabilited: serverSettings.channelsCommandEnabledIsHabilited,
                    });

                    await prisma.guildSettings.update({
                        where: { id: interaction.guildId },
                        data: { chatBotEnabled: false },
                    });

                    interaction.update(menus.settings.dashboard(newSS));
                    return;
                } else {
                    const newSS = setServerSettings(interaction.guildId, {
                        chatBotChannels: serverSettings.chatBotChannels,
                        chatBotEnabled: true,
                        channelsCommandDisabled: serverSettings.channelsCommandDisabled,
                        channelsCommandEnabled: serverSettings.channelsCommandEnabled,
                        channelsCommandDisabledIsHabilited: serverSettings.channelsCommandDisabledIsHabilited,
                        channelsCommandEnabledIsHabilited: serverSettings.channelsCommandEnabledIsHabilited,
                    });

                    await prisma.guildSettings.upsert({
                        where: { id: interaction.guildId },
                        update: { chatBotEnabled: true },
                        create: { id: interaction.guildId, chatBotEnabled: true },
                    });

                    interaction.update(menus.settings.dashboard(newSS));
                    return;
                }
            }
        }
    },
});