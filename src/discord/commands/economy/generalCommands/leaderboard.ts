import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyLeaderboardCommand(interaction: ChatInputCommandInteraction<"cached">) {
    interaction.reply(menus.leaderboard.startRanking(null, null))
    return;
}