import { setupCreators } from "#base";
import { res } from "#utils";

export const { createCommand, createEvent, createResponder } = setupCreators({
    commands: {
        guilds: ["1172930138770526248"],
        onNotFound: (interaction) => {
            interaction.reply(res.danger("Command not found!", { flags: ["Ephemeral"] }));
        },
        onError(error, interaction) {
            console.error(error);

            const errorMessage = `**An error occurred while executing the command: \`${error instanceof Error ? error.message : "Unknown error"}\`**`;

            if (interaction.deferred) {
                interaction.editReply(res.danger(errorMessage));
            } else if (!interaction.replied) {
                interaction.reply(res.danger(errorMessage));
            }
        },
    },
});