package development.commands.miscelanius.botinfos

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import net.dv8tion.jda.api.interactions.commands.build.Commands
import net.dv8tion.jda.api.interactions.commands.build.SubcommandData
import studio.styx.erisbot.core.registers.SlashCommand
import studio.styx.utils.ErrorEmbedUtil
import java.awt.Color

class BotCommands : SlashCommand {
    override fun execute(event: SlashCommandInteractionEvent) {
        val subcommand = event.subcommandName

        when (subcommand) {
            "info" -> {
                val embed = EmbedBuilder()
                    .setDescription(
                        "# Minhas informações \n" +
                                "- Eu sou um bot de Discord feito em **Kotlin**, utilizando a biblioteca **JDA**.\n" +
                                "- Meu nome Éris é inspirado na deusa grega da discórdia e da confusão.\n" +
                                "- Eu sou um bot de código aberto, e você pode me encontrar no [Github](https://github.com/studio-styx/erisbot)\n" +
                                "- Eu fui feito pelo Studio Styx, use `/bot creators` para saber mais sobre nós."
                    )
                    .setColor(Color.green)
                    .setThumbnail(event.jda.selfUser.avatarUrl)
                    .setTimestamp(java.time.Instant.now())
                    .setFooter("Executado por ${event.user.name}", event.user.avatarUrl)

                event.replyEmbeds(embed.build()).setEphemeral(true).queue()
            }
            else -> {
                val errorEmbedUtil = ErrorEmbedUtil()
                errorEmbedUtil.sendErrorEmbed(event, "Comando não encontrado")
            }
        }

    }

    override fun getSlashCommandData(): CommandData {
        return Commands.slash("bot", "Mostra os comandos do bot")
            .addSubcommands(
                SubcommandData("info", "Mostra informações sobre o bot"),
                SubcommandData("creators", "Mostra informações sobre os criadores do bot")
            )
    }

}