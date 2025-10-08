import { Store, setupCreators } from "#base";
import { prisma } from "#database";
import { getCommandId, getServerSettings, icon, isBlacklisted, PrismaBlacklistValue, res, resv2 } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { channelMention, Interaction, time } from "discord.js";

const cooldown = new Store<Date>();

export const { createCommand, createEvent, createResponder } = setupCreators({
    commands: {
        // guilds: [ "1395383469210865694" ],
        onNotFound: (interaction) => {
            interaction.reply(res.danger(`${icon.error} | Command not found!`));
        },
        onError(error, interaction) {
            console.error(`Error in: ${interaction.guild?.name || "Guild not found"} used by user: ${interaction.user.displayName}. error:`, error);

            const errorMessage = `**${icon.error} | An error occurred while executing the command: \`${error instanceof Error ? error.message : "Unknown error"}\`**`;

            if (interaction.deferred) {
                try {
                    interaction.editReply(res.danger(errorMessage));
                } catch (_) {
                    try {
                        interaction.editReply(resv2.danger(errorMessage));
                    } catch (_) {
                        interaction.followUp(res.danger(errorMessage))
                    }
                }
            } else if (!interaction.replied) {
                interaction.reply(res.danger(errorMessage));
            }
        },
        async middleware(interaction, block) {
            console.log(`Comando usado no server: ${interaction.guild?.name} pelo usuário: ${interaction.user.displayName} o comando: ${interaction.commandName}, data: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`)
            
            const blacklisted = isBlacklisted(interaction.user.id);
            if (blacklisted) {
                await interaction.deferReply({ flags })
                const user = await prisma.user.findUnique({
                    where: {
                        id: interaction.user.id
                    },
                    select: {
                        blacklist: true
                    }
                });
                const blacklist = user!.blacklist as unknown as PrismaBlacklistValue;
                interaction.editReply(res.danger(brBuilder(
                    `${icon.error} | Você está banido de usar as funções da **Éris**!`,
                    `> Você está banido desde ${blacklist.bannedAt}`,
                    `> Pelo motivo: ${blacklist.reason}`,
                    `> E termina em: ${blacklist.endAt ? time(blacklist.endAt, "R") : "Nunca"}`
                )))
                block();
                return;
            }

            if (cooldown.has(interaction.user.id)) {
                interaction.reply(res.danger(`${icon.error} | Acalme-se! você está sendo muito rápido, por favor aguarde ${time(cooldown.get(interaction.user.id)!, "R")} para usar comandos novamente!`));
                block()
                return;
            }

            if (!interaction.guildId) return;

            const serverSettings = getServerSettings(interaction.guildId)
                || await prisma.guildSettings.upsert({ where: { id: interaction.guildId }, create: { id: interaction.user.id }, update: {}} );

            const channelId = interaction.channelId;
            if (serverSettings.channelsCommandDisabledIsHabilited && serverSettings.channelsCommandDisabled.includes(channelId) && !interaction.memberPermissions?.has("Administrator")) {
                interaction.reply(res.danger(`${icon.error} | This command is disabled in this channel!`));
                block()
                return;
            }
            if (serverSettings.channelsCommandEnabledIsHabilited && !serverSettings.channelsCommandEnabled.includes(channelId) && !interaction.memberPermissions?.has("Administrator")) {
                interaction.reply(res.danger(`${icon.error} | This command is disabled in this channel!, and only works in: ${serverSettings.channelsCommandEnabled.map(channel => channelMention(channel)).join(", ")}`));
                block()
                return;
            }
            cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 2), { time: 1000 * 2 });
        },
        async after(interaction) {
            const mails = await prisma.mails.findMany({
                where: {
                    userId: interaction.user.id,
                    asRead: false
                }
            })

            if (mails.length === 0) return;
            const random = Math.random();
            const chance = 0.3;
            if (random < chance) {
                const commandId = await getCommandId(interaction as Interaction, "mail")
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(res.warning(`${icon.mail} | Você tem cartas não lidas! use </mail:${commandId}> para ver as cartas!`));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(res.warning(`${icon.mail} | Você tem cartas não lidas! use </mail:${commandId}> para ver as cartas!`));
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp(res.warning(`${icon.mail} | Você tem cartas não lidas! use </mail:${commandId}> para ver as cartas!`));
                        }
                    }
                }
            }
            return;
        },
    },
    responders: {
        onNotFound(interaction) {
            interaction.reply(res.danger(`${icon.error} | Responder not found!`, { flags: ["Ephemeral"] }));
        },
        onError(error, interaction) {
            console.error(`Error in: ${interaction.guild?.name || "Guild not found"} used by user: ${interaction.user.displayName}. error:`, error);

            const errorMessage = `**${icon.error} | An error occurred while executing the responder: \`${error instanceof Error? error.message : "Unknown error"}\`**`;

            if (interaction.deferred) {
                try {
                    interaction.editReply(res.danger(errorMessage));
                } catch (_) {
                    try {
                        interaction.editReply(resv2.danger(errorMessage));
                    } catch (_) {
                        interaction.followUp(res.danger(errorMessage))
                    }
                }
            } else if (!interaction.replied) {
                interaction.reply(res.danger(errorMessage));
            }
        },
        async middleware(interaction, block) {
            const blacklisted = isBlacklisted(interaction.user.id);
            if (blacklisted) {
                await interaction.deferReply({ flags })
                const user = await prisma.user.findUnique({
                    where: {
                        id: interaction.user.id
                    },
                    select: {
                        blacklist: true
                    }
                });
                const blacklist = user!.blacklist as unknown as PrismaBlacklistValue;
                interaction.editReply(res.danger(brBuilder(
                    `${icon.error} | Você está banido de usar as funções da **Éris**!`,
                    `> Você está banido desde ${blacklist.bannedAt}`,
                    `> Pelo motivo: ${blacklist.reason}`,
                    `> E termina em: ${blacklist.endAt ? time(blacklist.endAt, "R") : "Nunca"}`
                )))
                block();
                return;
            }

            if (cooldown.has(interaction.user.id)) {
                interaction.reply(res.danger(`${icon.error} | Acalme-se! você está sendo muito rápido, por favor aguarde ${time(cooldown.get(interaction.user.id)!, "R")} para usar comandos novamente!`));
                block()
                return;
            }
            if (interaction.customId.startsWith("fishing")) return;
            cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 1.6), { time: 1000 * 1.6 });
        }
    }
});