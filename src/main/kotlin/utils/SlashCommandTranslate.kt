package studio.styx.utils

import net.dv8tion.jda.api.interactions.DiscordLocale
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import net.dv8tion.jda.api.interactions.commands.build.Commands
import net.dv8tion.jda.api.interactions.commands.build.SubcommandData
import net.dv8tion.jda.api.interactions.commands.build.SubcommandGroupData

/**
 * Classe utilitária para traduzir nomes e descrições de Slash Commands, subcomandos e grupos de subcomandos
 * usando arquivos de tradução JSON localizados em src/main/resources/locales/{idioma}/commands/{commandName}.json.
 */
class SlashCommandTranslate(
    private val commandName: String,
    private val defaultDescription: String = "Command description"
) {

    private val supportedLocales = mapOf(
        DiscordLocale.ENGLISH_US to "en_us",
        DiscordLocale.PORTUGUESE_BRAZILIAN to "pt_br",
        DiscordLocale.SPANISH to "es_es"
    )

    /**
     * Gera o CommandData com traduções para o comando principal, subcomandos e grupos de subcomandos.
     * @param subcommands Lista de subcomandos, se houver.
     * @param subcommandGroups Lista de grupos de subcomandos, se houver.
     */
    fun getTranslatedCommandData(
        subcommands: List<SubcommandConfig> = emptyList(),
        subcommandGroups: List<SubcommandGroupConfig> = emptyList()
    ): CommandData {
        val command = Commands.slash(commandName, defaultDescription)

        // Aplicar traduções para o comando principal
        command.setNameLocalizations(getNameLocalizations(commandName))
        command.setDescriptionLocalizations(getDescriptionLocalizations(commandName))

        // Adicionar subcomandos, se fornecidos
        if (subcommands.isNotEmpty()) {
            command.addSubcommands(
                subcommands.map { sub ->
                    SubcommandData(sub.name, sub.description)
                        .setNameLocalizations(getSubcommandNameLocalizations(sub.name))
                        .setDescriptionLocalizations(getSubcommandDescriptionLocalizations(sub.name))
                }
            )
        }

        // Adicionar grupos de subcomandos, se fornecidos
        if (subcommandGroups.isNotEmpty()) {
            command.addSubcommandGroups(
                subcommandGroups.map { group ->
                    SubcommandGroupData(group.name, group.description)
                        .setNameLocalizations(getSubcommandGroupNameLocalizations(group.name))
                        .setDescriptionLocalizations(getSubcommandGroupDescriptionLocalizations(group.name))
                        .addSubcommands(
                            group.subcommands.map { sub ->
                                SubcommandData(sub.name, sub.description)
                                    .setNameLocalizations(getSubcommandNameLocalizations(sub.name, group.name))
                                    .setDescriptionLocalizations(getSubcommandDescriptionLocalizations(sub.name, group.name))
                            }
                        )
                }
            )
        }

        return command
    }

    /**
     * Configuração de um subcomando.
     */
    data class SubcommandConfig(
        val name: String,
        val description: String
    )

    /**
     * Configuração de um grupo de subcomandos.
     */
    data class SubcommandGroupConfig(
        val name: String,
        val description: String,
        val subcommands: List<SubcommandConfig>
    )

    /**
     * Obtém traduções para o nome do comando principal.
     */
    private fun getNameLocalizations(path: String): Map<DiscordLocale, String> {
        return supportedLocales.mapValues { (locale, lang) ->
            val translator = Translate(lang)
            translator.getTranslate("commands", commandName, "name")?.takeIf { it.isNotBlank() } ?: path
        }
    }

    /**
     * Obtém traduções para a descrição do comando principal.
     */
    private fun getDescriptionLocalizations(path: String): Map<DiscordLocale, String> {
        return supportedLocales.mapValues { (locale, lang) ->
            val translator = Translate(lang)
            translator.getTranslate("commands", commandName, "description")?.takeIf { it.isNotBlank() } ?: defaultDescription
        }
    }

    /**
     * Obtém traduções para o nome de um subcomando.
     */
    private fun getSubcommandNameLocalizations(subcommand: String, group: String? = null): Map<DiscordLocale, String> {
        return supportedLocales.mapValues { (locale, lang) ->
            val translator = Translate(lang)
            val path = if (group != null) {
                "subcommands.$group.$subcommand.name"
            } else {
                "subcommands.$subcommand.name"
            }
            translator.getTranslate("commands", commandName, path)?.takeIf { it.isNotBlank() } ?: subcommand
        }
    }

    /**
     * Obtém traduções para a descrição de um subcomando.
     */
    private fun getSubcommandDescriptionLocalizations(subcommand: String, group: String? = null): Map<DiscordLocale, String> {
        return supportedLocales.mapValues { (locale, lang) ->
            val translator = Translate(lang)
            val path = if (group != null) {
                "subcommands.$group.$subcommand.description"
            } else {
                "subcommands.$subcommand.description"
            }
            translator.getTranslate("commands", commandName, path)?.takeIf { it.isNotBlank() } ?: "Subcommand description"
        }
    }

    /**
     * Obtém traduções para o nome de um grupo de subcomandos.
     */
    private fun getSubcommandGroupNameLocalizations(group: String): Map<DiscordLocale, String> {
        return supportedLocales.mapValues { (locale, lang) ->
            val translator = Translate(lang)
            translator.getTranslate("commands", commandName, "subcommands.$group.name")?.takeIf { it.isNotBlank() } ?: group
        }
    }

    /**
     * Obtém traduções para a descrição de um grupo de subcomandos.
     */
    private fun getSubcommandGroupDescriptionLocalizations(group: String): Map<DiscordLocale, String> {
        return supportedLocales.mapValues { (locale, lang) ->
            val translator = Translate(lang)
            translator.getTranslate("commands", commandName, "subcommands.$group.description")?.takeIf { it.isNotBlank() } ?: "Subcommand group description"
        }
    }
}