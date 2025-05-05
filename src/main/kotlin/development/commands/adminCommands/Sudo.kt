package development.commands.adminCommands

import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.interactions.commands.OptionType
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import net.dv8tion.jda.api.interactions.commands.build.Commands
import net.dv8tion.jda.api.interactions.commands.build.SubcommandData
import net.dv8tion.jda.api.interactions.commands.build.SubcommandGroupData
import studio.styx.development.commands.adminCommands.database.BrutQuery
import studio.styx.erisbot.core.registers.SlashCommand
import studio.styx.utils.ErrorEmbedUtil
import studio.styx.utils.SlashCommandTranslate

class Sudo : SlashCommand {
    private val translator = SlashCommandTranslate(
        commandName = "sudo",
        defaultDescription = "See all commands"
    )

    override fun execute(event: SlashCommandInteractionEvent) {
        if (!event.user.id.equals("1171963692984844401")) {
            event.reply("You are not allowed to use this command.").queue()
            return
        }

        val subCommandGroupName = event.subcommandGroup
        val subCommandName = event.subcommandName

        event.deferReply().queue { hook ->
            try {
                when (subCommandGroupName) {
                    "db" -> {
                        when (subCommandName) {
                            "brut-query" -> {
                                val query = event.getOption("query")?.asString

                                val brutQuery = BrutQuery()
                                brutQuery.execute(event, hook, query ?: "")
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                ErrorEmbedUtil().editDeferWithErrorEmbed(
                    hook,
                    "An error occurred while executing the command: ${e.message}"
                )
            }
        }
    }

    override fun getSlashCommandData(): CommandData {
        return Commands.slash("sudo", "sudo commands")
            .addSubcommandGroups(
                SubcommandGroupData("db", "Database commands")
                    .addSubcommands(
                        SubcommandData("brut-query", "Make a brut query")
                            .addOption(
                                OptionType.STRING,
                                "query",
                                "Command query to execute",
                                true
                            )
                    )
            )
    }

}
//        return translator.getTranslatedCommandData(
//            subcommandGroups = listOf(
//                SlashCommandTranslate.SubcommandGroupConfig(
//                    name = "database",
//                    description = "Sudo Database commands",
//                    subcommands = listOf(
//                        SlashCommandTranslate.SubcommandConfig(
//                            name = "brut-query",
//                            description = "make a brut query",
//                            options = listOf(
//                                SlashCommandTranslate.OptionConfig(
//                                    type = OptionType.STRING,
//                                    name = "query",
//                                    description = "command query to execute",
//                                    required = true
//                                ),
//                                SlashCommandTranslate.OptionConfig(
//                                    type = OptionType.BOOLEAN,
//                                    name = "results",
//                                    description = "returns a result of query",
//                                    required = false
//                                )
//                            )
//                        )
//                    )
//                )
//            )
//        )
