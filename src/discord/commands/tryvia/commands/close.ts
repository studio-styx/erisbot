import { redis } from "#database";
import { icon, res } from "#functions";
import { TryviaGame } from "#types/tryviaGames.js";
import { ChatInputCommandInteraction } from "discord.js";

export async function closeTryviaGame(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();
    const haw = await redis.get(`tryvia:game:${interaction.channelId}`);
    if (!haw) {
        interaction.editReply(res.danger(`${icon.denied} | Não existe um jogo nesse canal!`))
        return;
    }
    const game = JSON.parse(haw) as TryviaGame;
    const hasPerm = game.owner === interaction.user.id 
        || interaction.memberPermissions.has("ManageChannels")
        || interaction.memberPermissions.has("ManageGuild")

    if (!hasPerm) {
        interaction.editReply(res.danger(`${icon.denied} | Você não tem permissão para acabar com a brincadeira dos outros! ${icon.Eris_Angry_left}`))
        return;
    }
}