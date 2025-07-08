import { Store, setupCreators } from "#base";
import { prisma } from "#database";
import { defaultServerSettings, getServerSettings } from "#functions";
import { res, icon } from "#utils";
import { channelMention, time } from "discord.js";

const cooldown = new Store<Date>();

export const { createCommand, createEvent, createResponder } = setupCreators({
    commands: {
        // guilds: [ "1172930138770526248", "1373806908149858334" ],
        onNotFound: (interaction) => {
            interaction.reply(res.danger(`${icon.error} | Command not found!`));
        },
        onError(error, interaction) {
            console.error(error);

            const errorMessage = `**${icon.error} | An error occurred while executing the command: \`${error instanceof Error ? error.message : "Unknown error"}\`**`;

            if (interaction.deferred) {
                interaction.editReply(res.danger(errorMessage));
            } else if (!interaction.replied) {
                interaction.reply(res.danger(errorMessage));
            }
        },
        async middleware(interaction, block) {
            if (cooldown.has(interaction.user.id)) {
                interaction.reply(res.danger(`${icon.error} | Acalme-se! você está sendo muito rápido, por favor aguarde ${time(cooldown.get(interaction.user.id)!, "R")} para usar comandos novamente!`));
                block()
                return;
            }
            if (!interaction.guildId) return;
            const serverSettings = getServerSettings(interaction.guildId)
                || await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } })
                || defaultServerSettings;

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
            cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 3), { time: 1000 * 3 });
        },
    },
    responders: {
        onNotFound(interaction) {
            interaction.reply(res.danger(`${icon.error} | Responder not found!`, { flags: ["Ephemeral"] }));
        },
        onError(error, interaction) {
            console.error(error);

            const errorMessage = `**${icon.error} | An error occurred while executing the responder: \`${error instanceof Error? error.message : "Unknown error"}\`**`;

            if (interaction.deferred) {
                interaction.editReply(res.danger(errorMessage));
            } else if (!interaction.replied) {
                interaction.reply(res.danger(errorMessage));
            }
        },
        async middleware(interaction, block) {
            if (cooldown.has(interaction.user.id)) {
                interaction.reply(res.danger(`${icon.error} | Acalme-se! você está sendo muito rápido, por favor aguarde ${time(cooldown.get(interaction.user.id)!, "R")} para usar comandos novamente!`));
                block()
                return;
            }
            cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 2.5), { time: 1000 * 2.5 });
        }
    }
});