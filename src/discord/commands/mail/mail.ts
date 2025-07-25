import { createCommand } from "#base";
import { prisma } from "#database";
import { menus } from "#menus";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "mail",
    description: "manage your mails",
    nameLocalizations: {
        "pt-BR": "correios",
        "en-US": "mail",
        "es-ES": "correo",
    },
    descriptionLocalizations: {
        "pt-BR": "gerenciar seus correios",
        "en-US": "manage your mail",
        "es-ES": "gestionar tu correo",
    },
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        await interaction.deferReply();

        const mails = await prisma.mails.findMany({
            where: {
                userId: interaction.user.id,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const user = await prisma.user.upsert({
            where: {
                id: interaction.user.id
            },
            update: {},
            create: {
                id: interaction.user.id,
            }
        });

        await interaction.editReply(menus.mails(mails, user, 0));
        return;
    }
});