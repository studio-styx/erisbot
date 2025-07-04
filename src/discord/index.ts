import { setupCreators } from "#base";
import { prisma } from "#database";
import { defaultServerSettings, getServerSettings } from "#functions";
import { res, icon } from "#utils";
import { channelMention } from "discord.js";

export const { createCommand, createEvent, createResponder } = setupCreators({
    commands: {
        // guilds: [ "1172930138770526248", "1373806908149858334"],
        onNotFound: (interaction) => {
            interaction.reply(res.danger(`${icon.error} | Command not found!`, { flags: ["Ephemeral"] }));
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
    }
});