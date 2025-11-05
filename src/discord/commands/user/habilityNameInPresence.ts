import { createCommand } from "#base";
import { prisma } from "#database";
import { res } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "presence",
    nameLocalizations: {
        "pt-BR": "presença",
        "es-ES": "presencia"
    },
    description: "manage how your name will be displayed in my presence",
    descriptionLocalizations: {
        "pt-BR": "gerencie como seu nome será exibido na minha presença",
        "es-ES": "administra cómo se mostrará tu nombre en mi presencia"
    },
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.deferReply({ flags });

        const user = await prisma.user.upsert({
            where: {
                id: interaction.user.id
            },
            create: {
                id: interaction.user.id
            },
            update: {}
        });

        if (user.showNameInPresence) {
            await prisma.user.update({
                where: {
                    id: interaction.user.id
                },
                data: {
                    showNameInPresence: false
                }
            })

            await interaction.editReply(res.success(
                brBuilder(
                    `## Nome na presença desabilitado!`,
                )
            ))
        } else {
            await prisma.user.update({
                where: {
                    id: interaction.user.id
                },
                data: {
                    showNameInPresence: true
                }
            })

            await interaction.editReply(res.success(
                brBuilder(
                    `## Nome na presença habilitado!`,
                    `Agora, quando ocorrer algo interessante, seu nome pode aparecer em meu status!`
                )
            ))
        }
    }
});