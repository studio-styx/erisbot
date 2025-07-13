import { createCommand } from "#base";
import { getServerSettings, setServerSettings } from "#functions";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { res } from "functions/utils/index.js";
import { ApplicationCommandType } from "discord.js";
import i18next from "i18next";

const prisma = new PrismaClient();

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

        const locale = interaction.locale

        await i18next.changeLanguage(interaction.locale);

        let serverSettings = getServerSettings(interaction.guildId);
        if (!serverSettings) {
            serverSettings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } }) || {
                chatBotChannels: [],
                chatBotEnabled: false,
                channelsCommandDisabled: [],
                channelsCommandEnabled: [],
                channelsCommandDisabledIsHabilited: false,
                channelsCommandEnabledIsHabilited: false,
            }
            setServerSettings(interaction.guildId, serverSettings);
        }

        interaction.reply(menus.settings.dashboard(serverSettings))
        return;
    }
});