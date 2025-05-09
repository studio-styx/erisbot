import { Interaction } from "discord.js";

export const getCommandId = async (interaction: Interaction, commandName: string): Promise<string> => {
    // Ensure we're using the correct environment variable and it's properly parsed
    const isDevelopment = process.env.DEVELOPMENT === "true";
    const guildId = isDevelopment ? "1172930138770526248" : null;

    // Fetch commands to ensure the cache is up-to-date
    if (guildId) {
        // For guild commands
        try {
            // Fetch guild commands to ensure cache is updated
            await interaction.client.application?.commands.fetch({ guildId });

            // Now search in the updated cache
            const command = interaction.client.application?.commands.cache.find(
                cmd => cmd.name.toLowerCase() === commandName.toLowerCase() && cmd.guildId === guildId
            );

            if (command) {
                return command.id;
            } else {
                console.log(`Command "${commandName}" not found in guild ${guildId}`);
                console.log("Available guild commands:",
                    [...interaction.client.application?.commands.cache.filter(cmd => cmd.guildId === guildId).values()]
                        .map(cmd => cmd.name)
                );
                return "command-not-found";
            }
        } catch (error) {
            console.error("Error fetching guild commands:", error);
            return "error-fetching-commands";
        }
    } else {
        // For global commands
        try {
            // Fetch global commands to ensure cache is updated
            await interaction.client.application?.commands.fetch();

            // Now search in the updated cache
            const command = interaction.client.application?.commands.cache.find(
                cmd => cmd.name.toLowerCase() === commandName.toLowerCase() && !cmd.guildId
            );

            if (command) {
                return command.id;
            } else {
                console.log(`Global command "${commandName}" not found`);
                console.log("Available global commands:",
                    [...interaction.client.application?.commands.cache.filter(cmd => !cmd.guildId).values()]
                        .map(cmd => cmd.name)
                );
                return "command-not-found";
            }
        } catch (error) {
            console.error("Error fetching global commands:", error);
            return "error-fetching-commands";
        }
    }
};
