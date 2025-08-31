import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { TryviaGame } from "#types/tryviaGames.js";
import { ChatInputCommandInteraction, userMention } from "discord.js";
import * as g from "../../../events/tryvia/response.js";

export async function closeTryviaGame(interaction: ChatInputCommandInteraction<"cached">) {
    if (!interaction.channel) {
        interaction.reply(res.danger(`${icon.error} | Esse comando deve ser usado em um canal de texto!`))
        return
    }
    const key = `tryvia:game:${interaction.channelId}`;
    await interaction.deferReply({ flags });
    const haw = await redis.get(key);
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

    g.timeoutMap.delete(key);
    const top1User = await interaction.client.users.fetch(game.participants[0]?.id).catch(() => interaction.client.user);
    if (game.participants.length > 2) {
        await prisma.guildMember.upsert({
            where: {
                guildId_id: {
                    id: top1User.id,
                    guildId: interaction.guildId!,
                },
            },
            update: {
                tryviaWins: {
                    increment: 1
                }
            },
            create: {
                tryviaWins: 1,
                id: top1User.id,
                guildId: interaction.guildId!,
            }
        })
    }
    
    const message = await g.sendGameOverMessage(interaction.channel, game, top1User);
    await redis.del(key);
    await interaction.editReply(res.success(`${icon.success} | Jogo fechado com sucesso!`))
    await message.reply(res.danger(`${icon.Eris_cry} | O usuário ${userMention(interaction.user.id)} fechou o jogo de trivia desse canal! Que pena, o jogo estava tão divertido...`))
    if (game.participants.length < 3) {
        message.reply(res.danger(`${icon.Eris_cry} | Infelizmente como tivemos menos de **3** participantes o ganhador não ganhou wins.`))
    }
    return;
}