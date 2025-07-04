import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getServerSettings, setServerSettings } from "#functions";
import { menus } from "#menus";
import { channelMention } from "discord.js";

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

        await interaction.deferUpdate();

        switch (action) {
            case "disableChannels": {
                if (!interaction.isChannelSelectMenu()) return;
            
                const channels = interaction.values;
            
                // Remove todos os canais escolhidos de channelsCommandEnabled
                serverSettings.channelsCommandEnabled = serverSettings.channelsCommandEnabled.filter(
                    channel => !channels.includes(channel)
                );
            
                serverSettings.channelsCommandDisabled = channels;
            
                await prisma.$transaction([
                    prisma.guildSettings.upsert({
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
                    }),
                    prisma.log.create({
                        data: {
                            message: `Setou os canais ${channels.map(channel => channelMention(channel)).join(", ")} como canais que não podem usar comandos`,
                            level: 5,
                            type: "warn",
                            userId: interaction.user.id,
                            name: `Dashboard-setting-channelsCommandDisabled-${interaction.guildId}`,
                        }
                    })
                ]);
            
                setServerSettings(interaction.guildId, serverSettings);
                interaction.editReply(menus.settings.dashboard(serverSettings));
                return;
            }            
            case "enableDisableChannels": {
                if (!interaction.isButton()) return;
            
                const wasDisabled = serverSettings.channelsCommandDisabledIsHabilited;
                const newDisabledState = !wasDisabled;
            
                serverSettings.channelsCommandDisabledIsHabilited = newDisabledState;
                serverSettings.channelsCommandEnabledIsHabilited = false;
            
                await prisma.$transaction([
                    prisma.guildSettings.upsert({
                        where: { id: interaction.guildId },
                        update: {
                            channelsCommandDisabledIsHabilited: newDisabledState,
                            channelsCommandEnabledIsHabilited: false
                        },
                        create: {
                            id: interaction.guildId,
                            channelsCommandDisabledIsHabilited: newDisabledState
                        },
                    }),
                    prisma.log.create({
                        data: {
                            message: `Alterou o modo "canais que NÃO podem usar comandos" para ${newDisabledState ? "ativado" : "desativado"}, e desativou o modo "SOMENTE nesses canais"`,
                            level: 5,
                            type: "warn",
                            userId: interaction.user.id,
                            name: `Dashboard-toggle-channelsCommandDisabled-${interaction.guildId}`,
                        }
                    })
                ]);
            
                setServerSettings(interaction.guildId, serverSettings);
                interaction.editReply(menus.settings.dashboard(serverSettings));
                return;
            }            
            case "onlyChannels": {
                if (!interaction.isChannelSelectMenu()) return;
            
                const channels = interaction.values;
            
                const removed = serverSettings.channelsCommandDisabled.filter(channel => channels.includes(channel));
                serverSettings.channelsCommandDisabled = serverSettings.channelsCommandDisabled.filter(
                    channel => !channels.includes(channel)
                );
            
                serverSettings.channelsCommandEnabled = channels;
            
                await prisma.$transaction([
                    prisma.guildSettings.upsert({
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
                    }),
                    prisma.log.create({
                        data: {
                            message: `Setou os canais ${channels.map(channel => channelMention(channel)).join(", ")} como canais EXCLUSIVOS para comandos. Removidos de canais bloqueados: ${removed.map(channel => channelMention(channel)).join(", ") || "nenhum"}`,
                            level: 5,
                            type: "warn",
                            userId: interaction.user.id,
                            name: `Dashboard-setting-channelsCommandEnabled-${interaction.guildId}`,
                        }
                    })
                ]);
            
                setServerSettings(interaction.guildId, serverSettings);
                interaction.editReply(menus.settings.dashboard(serverSettings));
                return;
            }
            case "enableOnlyChannels": {
                if (!interaction.isButton()) return;
            
                const wasEnabled = serverSettings.channelsCommandEnabledIsHabilited;
                const newEnabledState = !wasEnabled;
            
                serverSettings.channelsCommandEnabledIsHabilited = newEnabledState;
                serverSettings.channelsCommandDisabledIsHabilited = false;
            
                await prisma.$transaction([
                    prisma.guildSettings.upsert({
                        where: { id: interaction.guildId },
                        update: {
                            channelsCommandEnabledIsHabilited: newEnabledState,
                            channelsCommandDisabledIsHabilited: false
                        },
                        create: {
                            id: interaction.guildId,
                            channelsCommandEnabledIsHabilited: newEnabledState
                        },
                    }),
                    prisma.log.create({
                        data: {
                            message: `Alterou o modo "SOMENTE nesses canais" para ${newEnabledState ? "ativado" : "desativado"}, e desativou o modo "canais que NÃO podem usar comandos"`,
                            level: 5,
                            type: "warn",
                            userId: interaction.user.id,
                            name: `Dashboard-toggle-channelsCommandEnabled-${interaction.guildId}`,
                        }
                    })
                ]);
            
                setServerSettings(interaction.guildId, serverSettings);
                interaction.editReply(menus.settings.dashboard(serverSettings));
                return;
            }            
        }
    },
});