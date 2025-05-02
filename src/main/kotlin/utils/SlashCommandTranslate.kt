package studio.styx.utils

import net.dv8tion.jda.api.interactions.DiscordLocale
import net.dv8tion.jda.api.interactions.commands.Command
import net.dv8tion.jda.api.interactions.commands.build.*
import net.dv8tion.jda.api.interactions.commands.OptionType

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
     * Gera o CommandData com traduções para o comando principal, subcomandos, grupos de subcomandos e opções
     */
    fun getTranslatedCommandData(
        subcommands: List<SubcommandConfig> = emptyList(),
        subcommandGroups: List<SubcommandGroupConfig> = emptyList(),
        options: List<OptionConfig> = emptyList()
    ): CommandData {
        val command = Commands.slash(commandName, defaultDescription)

        // Aplicar traduções para o comando principal
        command.setNameLocalizations(getNameLocalizations())
        command.setDescriptionLocalizations(getDescriptionLocalizations())

        // Adicionar opções ao comando principal
        options.forEach { option ->
            command.addOptions(createOptionData(option))
        }

        // Adicionar subcomandos
        subcommands.forEach { subcommand ->
            val sub = SubcommandData(subcommand.name, subcommand.description)
                .setNameLocalizations(getSubcommandNameLocalizations(subcommand.name))
                .setDescriptionLocalizations(getSubcommandDescriptionLocalizations(subcommand.name))

            // Adicionar opções ao subcomando
            subcommand.options.forEach { option ->
                sub.addOptions(createOptionData(option, subcommand.name))
            }

            command.addSubcommands(sub)
        }

        // Adicionar grupos de subcomandos
        subcommandGroups.forEach { group ->
            val groupData = SubcommandGroupData(group.name, group.description)
                .setNameLocalizations(getSubcommandGroupNameLocalizations(group.name))
                .setDescriptionLocalizations(getSubcommandGroupDescriptionLocalizations(group.name))

            group.subcommands.forEach { subcommand ->
                val sub = SubcommandData(subcommand.name, subcommand.description)
                    .setNameLocalizations(getSubcommandNameLocalizations(subcommand.name, group.name))
                    .setDescriptionLocalizations(getSubcommandDescriptionLocalizations(subcommand.name, group.name))

                // Adicionar opções ao subcomando dentro do grupo
                subcommand.options.forEach { option ->
                    sub.addOptions(createOptionData(option, subcommand.name, group.name))
                }

                groupData.addSubcommands(sub)
            }

            command.addSubcommandGroups(groupData)
        }

        return command
    }

    private fun createOptionData(
        option: OptionConfig,
        subcommand: String? = null,
        group: String? = null
    ): OptionData {
        return OptionData(option.type, option.name, option.description, option.required)
            .setNameLocalizations(getOptionNameLocalizations(option.name, subcommand, group))
            .setDescriptionLocalizations(getOptionDescriptionLocalizations(option.name, subcommand, group))
            .apply {
                option.choices.forEach { choice ->
                    addChoices(
                        Command.Choice(choice.name, choice.value)
                            .setNameLocalizations(getOptionChoiceLocalizations(option.name, choice.name, subcommand, group))
                    )
                }
            }
    }

    // Classes de configuração
    data class SubcommandConfig(
        val name: String,
        val description: String,
        val options: List<OptionConfig> = emptyList()
    )

    data class SubcommandGroupConfig(
        val name: String,
        val description: String,
        val subcommands: List<SubcommandConfig>
    )

    data class OptionConfig(
        val type: OptionType,
        val name: String,
        val description: String,
        val required: Boolean = false,
        val choices: List<OptionChoiceConfig> = emptyList()
    )

    data class OptionChoiceConfig(
        val name: String,
        val value: String
    )

    // Métodos de tradução
    private fun getNameLocalizations(): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val translation = Translate(lang).getTranslate("commands", commandName, "name")
            translation?.let { locale to it }
        }.toMap()
    }

    private fun getDescriptionLocalizations(): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val translation = Translate(lang).getTranslate("commands", commandName, "description")
            translation?.let { locale to it } ?: (locale to defaultDescription)
        }.toMap()
    }

    private fun getSubcommandNameLocalizations(
        subcommand: String,
        group: String? = null
    ): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val path = if (group != null) {
                "subcommandgroups.$group.subcommands.$subcommand.name"
            } else {
                "subcommands.$subcommand.name"
            }
            val translation = Translate(lang).getTranslate("commands", commandName, path)
            translation?.let { locale to it } ?: (locale to subcommand)
        }.toMap()
    }

    private fun getSubcommandDescriptionLocalizations(
        subcommand: String,
        group: String? = null
    ): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val path = if (group != null) {
                "subcommandgroups.$group.subcommands.$subcommand.description"
            } else {
                "subcommands.$subcommand.description"
            }
            val translation = Translate(lang).getTranslate("commands", commandName, path)
            translation?.let { locale to it } ?: (locale to "Subcommand description")
        }.toMap()
    }

    private fun getSubcommandGroupNameLocalizations(group: String): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val translation = Translate(lang).getTranslate("commands", commandName, "subcommandgroups.$group.name")
            translation?.let { locale to it } ?: (locale to group)
        }.toMap()
    }

    private fun getSubcommandGroupDescriptionLocalizations(group: String): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val translation = Translate(lang).getTranslate("commands", commandName, "subcommandgroups.$group.description")
            translation?.let { locale to it } ?: (locale to "Subcommand group description")
        }.toMap()
    }

    private fun getOptionNameLocalizations(
        option: String,
        subcommand: String? = null,
        group: String? = null
    ): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val path = when {
                group != null && subcommand != null -> "subcommandgroups.$group.subcommands.$subcommand.options.$option.name"
                subcommand != null -> "subcommands.$subcommand.options.$option.name"
                else -> "options.$option.name"
            }
            val translation = Translate(lang).getTranslate("commands", commandName, path)
            translation?.let { locale to it } ?: (locale to option)
        }.toMap()
    }

    private fun getOptionDescriptionLocalizations(
        option: String,
        subcommand: String? = null,
        group: String? = null
    ): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val path = when {
                group != null && subcommand != null -> "subcommandgroups.$group.subcommands.$subcommand.options.$option.description"
                subcommand != null -> "subcommands.$subcommand.options.$option.description"
                else -> "options.$option.description"
            }
            val translation = Translate(lang).getTranslate("commands", commandName, path)
            translation?.let { locale to it } ?: (locale to "Option description")
        }.toMap()
    }

    private fun getOptionChoiceLocalizations(
        option: String,
        choice: String,
        subcommand: String? = null,
        group: String? = null
    ): Map<DiscordLocale, String> {
        return supportedLocales.mapNotNull { (locale, lang) ->
            val path = when {
                group != null && subcommand != null -> "subcommandgroups.$group.subcommands.$subcommand.options.$option.choices.$choice"
                subcommand != null -> "subcommands.$subcommand.options.$option.choices.$choice"
                else -> "options.$option.choices.$choice"
            }
            val translation = Translate(lang).getTranslate("commands", commandName, path)
            translation?.let { locale to it } ?: (locale to choice)
        }.toMap()
    }
}