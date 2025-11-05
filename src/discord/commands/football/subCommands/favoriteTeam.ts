import { prisma } from "#database";
import { icon, res } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";
import z from "zod";

export async function footballUserFavoriteTeam(interaction: ChatInputCommandInteraction<"cached">) {
    const teamIdChema = z.coerce.bigint("Especifique um time válido!").positive("Especifique um time válido!");
    const teamId = teamIdChema.parse(interaction.options.getString("team"));

    await interaction.deferReply();

    const [user, team] = await prisma.$transaction([
        prisma.user.upsert({
            where: {
                id: interaction.user.id
            },
            create: { id: interaction.user.id },
            update: {}
        }),
        prisma.footballTeam.findUnique({
            where: {
                id: teamId
            }
        })
    ])

    if (!team) throw new Error("Eu não consegui encontrar esse time!");

    if (user.favoriteTeamId === teamId) throw new Error("Você já torce para esse time!");

    await prisma.user.update({
        where: {
            id: interaction.user.id
        },
        data: {
            favoriteTeamId: teamId
        }
    });

    await interaction.editReply(res.success(`${icon.success} | Agora você está torcendo para o **${team.name}**`))
}