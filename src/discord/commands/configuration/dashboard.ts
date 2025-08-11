import { createCommand } from "#base";
import { icon, res } from "#functions";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";
createCommand({
    name: "dashboard",
    description: "see the dashboard configuration",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [ "ManageGuild" ],
    nameLocalizations: {
        "pt-BR": "painel",
        "es-ES": "dashboard",
        "en-US": "dashboard"
    },
    descriptionLocalizations: {
        "pt-BR": "veja a configuração do painel",
        "es-ES": "vea la configuración del panel",
        "en-US": "see the dashboard configuration"
    },
    dmPermission: false,
    async run(interaction){
        if (!interaction.member.permissions.has("ManageGuild")) {
            interaction.reply(res.danger("You don't have permission to use this command, do you need the \`ManageGuild\` permission!"));
            return;
        }

        interaction.reply({
            content: `ei, sabia que agora pode configurar seu server via website? clique no boão abaixo! ${icon.Eris_kiss_left}`,
            components: [
                createRow(
                    new ButtonBuilder({
                        style: ButtonStyle.Link,
                        label: "Dashboard",
                        url: `${process.env.FRONT_BASE_URL}/guilds/${interaction.guild.id}`
                    })
                )
            ]
        })

        return;
    }
});