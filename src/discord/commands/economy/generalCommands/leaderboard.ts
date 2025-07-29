import { prisma } from "#database";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction, userMention } from "discord.js";

export async function economyLeaderboardCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply()
    const users = await prisma.user.findMany({
        orderBy: [
            {
                money: "desc"
            },
            {
                bank: "desc"
            }
        ]
    });

    users.sort((a, b) => b.money.add(b.bank).toNumber() - a.money.add(a.bank).toNumber());

    const topUsers = users.slice(0, 10);
    const nextUsers = users.slice(10, 20);

    const richestUser = interaction.client.users.cache.get(topUsers[0].id);
    const findUser = (userid: string) => interaction.client.users.cache.get(userid);

    const embed = createEmbed({
        title: "Leaderboard",
        fields: [
            {
                name: "",
                value: topUsers.map((user, index) => `${index + 1}. ${findUser(user.id)?.displayName || "desconhecido"} - **${user.money.add(user.bank).toNumber()}** stx`).join("\n"),
                inline: true
            }
        ],
        color: settings.colors.success,
        thumbnail: richestUser?.avatarURL(),
        timestamp: new Date().toISOString()
    });

    if (nextUsers.length > 0) {
        embed.addFields([
            {
                name: "",
                value: nextUsers.map((user, index) => `${index + 11}. ${findUser(user.id)?.displayName || "desconhecido"} - **${user.money.add(user.bank).toNumber()}** stx`).join("\n"),
                inline: true
            }
        ]);
    }

    interaction.editReply({ embeds: [embed] });
    return;
}