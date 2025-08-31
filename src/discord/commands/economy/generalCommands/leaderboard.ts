import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyLeaderboardCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;
    if (!ephemeral) {
        await interaction.deferReply();
        interaction.editReply(menus.leaderboard.startRanking(null, null))
        return;
    }
    interaction.reply(menus.leaderboard.startRanking(null, null))
    return;
}