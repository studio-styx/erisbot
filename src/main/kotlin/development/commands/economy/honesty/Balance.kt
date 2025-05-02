package development.commands.economy.honesty

import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import studio.styx.erisbot.core.repository.UserRepository
import studio.styx.utils.ErrorEmbedUtil
import studio.styx.utils.Translate
import java.util.*

class Balance {
    fun execute(event: SlashCommandInteractionEvent) {
        event.deferReply().queue { hook ->
            val user = event.getOption("user")?.asUser ?: event.user

            val userLocale = event.userLocale?.locale?.lowercase(Locale.ROOT) ?: "en_us"
            val language = when (userLocale) {
                "pt-br" -> "pt_br"
                "en-us" -> "en_us"
                "es-es" -> "es_es"
                else -> "en_us"
            }

            if (user.isBot) {
                val response = Translate(language).getTranslate(
                    "commands", "economy", "subcommandgroups.honesty.subcommands.balance.errors.userIsBot"
                ) as String
                val errorEmbedUtil = ErrorEmbedUtil()
                errorEmbedUtil.editDeferWithErrorEmbed(hook, response)
                return@queue
            }

            val userRepo = UserRepository(user.id)

            val money = userRepo.getMoney()
            val bank = userRepo.getBank()


            val translator = Translate(language)
            val response = translator.getTranslate(
                "commands", "economy", "subcommandgroups.honesty.subcommands.balance.content",
                mapOf(
                    "user" to user.effectiveName,
                    "money" to money.toString(),
                    "bank" to bank.toString()
                )
            ) as String

            hook.editOriginal(response).queue()
        }
    }
}