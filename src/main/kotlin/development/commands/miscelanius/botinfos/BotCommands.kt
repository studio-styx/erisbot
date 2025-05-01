package development.commands.miscelanius.botinfos

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import studio.styx.erisbot.core.registers.SlashCommand
import studio.styx.utils.ErrorEmbedUtil
import studio.styx.utils.SlashCommandTranslate
import studio.styx.utils.Translate
import studio.styx.utils.colors
import java.io.File
import java.util.*

class BotCommands : SlashCommand {
    private val translator = SlashCommandTranslate(
        commandName = "bot",
        defaultDescription = "See all commands"
    )

    override fun execute(event: SlashCommandInteractionEvent) {
        val subcommand = event.subcommandName
        val userLocale = event.userLocale?.locale?.lowercase(Locale.ROOT) ?: "en_us"
        val language = when (userLocale) {
            "pt-br" -> "pt_br"
            "en-us" -> "en_us"
            "es-es" -> "es_es"
            else -> "en_us"
        }
        val translator = Translate(language)

        when (subcommand) {
            "info" -> {
                val version = getVersionFromBuildGradle() ?: translator.getTranslate(
                    "commands", "bot", "subcommands.info.errors.versionNotFound"
                ) ?: "Unknown"
                val embed = EmbedBuilder()
                    .setTitle(translator.getTranslate("commands", "bot", "subcommands.info.embed.title") ?: "Informações")
                    .setDescription(
                        translator.getTranslate(
                            "commands", "bot", "subcommands.info.embed.description",
                            placeholders = mapOf("user" to event.user.name, "version" to version)
                        ) ?: ""
                    )
                    .setColor(colors.pink)
                    .setThumbnail(event.jda.selfUser.avatarUrl)
                    .setTimestamp(java.time.Instant.now())
                    .setFooter(
                        translator.getTranslate(
                            "commands", "bot", "subcommands.info.embed.footer",
                            mapOf("user" to event.user.name)
                        ) ?: "", event.user.avatarUrl
                    )

                event.replyEmbeds(embed.build()).setEphemeral(true).queue()
            }
            "creators" -> {
                val embed = EmbedBuilder()
                    .setTitle("Studio styx")
                    .setDescription(translator.getTranslate(
                        "commands", "bot", "subcommands.creators.embed.description"
                    ))
                    .setColor(colors.darkPing)
                    .setTimestamp(java.time.Instant.now())

                event.replyEmbeds(embed.build()).setEphemeral(true).queue()
            }
            else -> {
                ErrorEmbedUtil().sendErrorEmbed(event, "Comando não encontrado")
            }
        }
    }

    override fun getSlashCommandData(): CommandData {
        return translator.getTranslatedCommandData(
            subcommands = listOf(
                SlashCommandTranslate.SubcommandConfig(
                    name = "info",
                    description = "See all infos from the bot"
                ),
                SlashCommandTranslate.SubcommandConfig(
                    name = "creators",
                    description = "See all infos from the bot creators"
                )
            )
        )
    }

    private fun getVersionFromBuildGradle(): String? {
        val buildFile = File("build.gradle.kts")
        if (!buildFile.exists()) {
            throw IllegalArgumentException("Arquivo build.gradle.kts não encontrado")
        }

        val versionRegex = Regex("""version\s*=\s*["'](.+?)["']""")
        val content = buildFile.readText()
        return versionRegex.find(content)?.groups?.get(1)?.value
    }
}
