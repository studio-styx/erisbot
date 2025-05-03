package development.commands.economy

import development.commands.economy.honesty.Balance
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.interactions.commands.OptionType
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import development.commands.economy.honesty.Deposit
import studio.styx.erisbot.core.registers.SlashCommand
import studio.styx.utils.ErrorEmbedUtil
import studio.styx.utils.SlashCommandTranslate

class RpCenterCommands : SlashCommand {
    private val translator = SlashCommandTranslate(
        commandName = "economy",
        defaultDescription = "See all commands"
    )

    override fun execute(event: SlashCommandInteractionEvent) {
        val ErrorEmbedUtil = ErrorEmbedUtil()

        when (event.subcommandGroup) {
            "honesty" -> {
                when (event.subcommandName) {
                    "balance" -> {
                        val balance = Balance()
                        balance.execute(event)
                    }
                    "deposit" -> {
                        val deposit = Deposit()
                        deposit.execute(event)
                    }

                    else -> {
                        ErrorEmbedUtil.sendErrorEmbed(event, "Command not found")
                    }
                }
            }

            else -> {
                ErrorEmbedUtil.sendErrorEmbed(event, "Command not found")
            }
        }
    }

    override fun getSlashCommandData(): CommandData {
        return translator.getTranslatedCommandData(
            subcommandGroups = listOf(
                SlashCommandTranslate.SubcommandGroupConfig(
                    name = "honesty",
                    description = "Rp commands",
                    subcommands = listOf(
                        SlashCommandTranslate.SubcommandConfig(
                            name = "balance",
                            description = "Check your balance",
                            options = listOf(
                                SlashCommandTranslate.OptionConfig(
                                    type = OptionType.USER,
                                    name = "user",
                                    description = "user to see balance",
                                    required = false
                                )
                            )
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "work",
                            description = "Work to earn money"
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "daily",
                            description = "Get your daily money"
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "deposit",
                            description = "Deposit money into your bank",
                            options = listOf(
                                SlashCommandTranslate.OptionConfig(
                                    type = OptionType.NUMBER,
                                    name = "amount",
                                    description = "Amount to deposit",
                                    required = true
                                )
                            )
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "withdraw",
                            description = "Withdraw money from your bank",
                            options = listOf(
                                SlashCommandTranslate.OptionConfig(
                                    type = OptionType.NUMBER,
                                    name = "amount",
                                    description = "amount to withdraw",
                                    required = true
                                )
                            )
                        ),
                    )
                ),
                SlashCommandTranslate.SubcommandGroupConfig(
                    name = "casino",
                    description = "Casino commands",
                    subcommands = listOf(
                        SlashCommandTranslate.SubcommandConfig(
                            name = "slots",
                            description = "Play slots"
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "blackjack",
                            description = "Play blackjack"
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "roulette",
                            description = "Play roulette"
                        ),
                    )
                ),
                SlashCommandTranslate.SubcommandGroupConfig(
                    name = "dishonest",
                    description = "Dishonest commands",
                    subcommands = listOf(
                        SlashCommandTranslate.SubcommandConfig(
                            name = "rob",
                            description = "Rob someone",
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "steal",
                            description = "Steal from someone"
                        ),
                        SlashCommandTranslate.SubcommandConfig(
                            name = "scam",
                            description = "Scam someone"
                        ),
                    )
                )
            )
        )
    }
}