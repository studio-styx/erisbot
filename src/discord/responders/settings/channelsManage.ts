import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getServerSettings, setServerSettings } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "dashboard/channelsManage/:action",
    types: [ResponderType.Button, ResponderType.ChannelSelect], cache: "cached",
    async run(interaction, { action }) {
        let serverSettings = getServerSettings(interaction.guildId) || await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } }) || {
            chatBotChannels: [],
            chatBotEnabled: false,
            channelsCommandDisabled: [],
            channelsCommandEnabled: [],
            channelsCommandDisabledIsHabilited: false,
            channelsCommandEnabledIsHabilited: false,
        }

        switch (action) {
            case "disableChannels": {
                if (!interaction.isChannelSelectMenu()) return;
            
                const channels = interaction.values;
            
                // Remove todos os canais escolhidos de channelsCommandEnabled
                serverSettings.channelsCommandEnabled = serverSettings.channelsCommandEnabled.filter(
                    channel => !channels.includes(channel)
                );
            
                serverSettings.channelsCommandDisabled = channels;
            
                await prisma.guildSettings.upsert({
                    where: { id: interaction.guildId },
                    update: {
                        channelsCommandDisabled: channels,
                        channelsCommandEnabled: serverSettings.channelsCommandEnabled,
                    },
                    create: {
                        id: interaction.guildId,
                        channelsCommandDisabled: channels,
                        channelsCommandEnabled: serverSettings.channelsCommandEnabled,
                    },
                });
            
                setServerSettings(interaction.guildId, serverSettings);
                interaction.update(menus.settings.dashboard(serverSettings));
                return;
            }            
            case "enableDisableChannels": {
                if (!interaction.isButton()) return;

                if (serverSettings.channelsCommandDisabledIsHabilited) {
                    serverSettings.channelsCommandDisabledIsHabilited = false;
                } else {
                    serverSettings.channelsCommandDisabledIsHabilited = true;
                }
                if (serverSettings.channelsCommandEnabledIsHabilited) {
                    serverSettings.channelsCommandEnabledIsHabilited = false;
                }

                await prisma.guildSettings.upsert({
                    where: { id: interaction.guildId },
                    update: { channelsCommandDisabledIsHabilited: serverSettings.channelsCommandDisabledIsHabilited, channelsCommandEnabledIsHabilited: serverSettings.channelsCommandEnabledIsHabilited },
                    create: { id: interaction.guildId, channelsCommandDisabledIsHabilited: serverSettings.channelsCommandDisabledIsHabilited },
                })

                setServerSettings(interaction.guildId, serverSettings);

                interaction.update(menus.settings.dashboard(serverSettings));
                return;
            }
            case "onlyChannels": {
                if (!interaction.isChannelSelectMenu()) return;
            
                const channels = interaction.values;
            
                // Remove todos os canais escolhidos de channelsCommandDisabled
                serverSettings.channelsCommandDisabled = serverSettings.channelsCommandDisabled.filter(
                    channel => !channels.includes(channel)
                );
            
                serverSettings.channelsCommandEnabled = channels;
            
                await prisma.guildSettings.upsert({
                    where: { id: interaction.guildId },
                    update: {
                        channelsCommandEnabled: channels,
                        channelsCommandDisabled: serverSettings.channelsCommandDisabled,
                    },
                    create: {
                        id: interaction.guildId,
                        channelsCommandEnabled: channels,
                        channelsCommandDisabled: serverSettings.channelsCommandDisabled,
                    },
                });
            
                setServerSettings(interaction.guildId, serverSettings);
                interaction.update(menus.settings.dashboard(serverSettings));
                return;
            }            
            case "enableOnlyChannels": {
                if (!interaction.isButton()) return;

                if (serverSettings.channelsCommandEnabledIsHabilited) {
                    serverSettings.channelsCommandEnabledIsHabilited = false;
                } else {
                    serverSettings.channelsCommandEnabledIsHabilited = true;
                }
                if (serverSettings.channelsCommandDisabledIsHabilited) {
                    serverSettings.channelsCommandDisabledIsHabilited = false;
                }

                await prisma.guildSettings.upsert({
                    where: { id: interaction.guildId },
                    update: { channelsCommandEnabledIsHabilited: serverSettings.channelsCommandEnabledIsHabilited, channelsCommandDisabledIsHabilited: serverSettings.channelsCommandDisabledIsHabilited },
                    create: { id: interaction.guildId, channelsCommandEnabledIsHabilited: serverSettings.channelsCommandEnabledIsHabilited },
                })

                setServerSettings(interaction.guildId, serverSettings);

                interaction.update(menus.settings.dashboard(serverSettings));
                return;
            }
        }
    },
});