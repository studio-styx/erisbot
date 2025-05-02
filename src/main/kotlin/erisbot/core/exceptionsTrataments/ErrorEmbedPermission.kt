package studio.styx.erisbot.core.exceptionHandlers

import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import java.util.Locale
import studio.styx.utils.Translate

class ErrorEmbedPermission(
    var title: String? = null,
    var description: String? = null,
    var footer: String? = null
) {

    private fun buildMessage(): String {
        return buildString {
            title?.let { appendLine(it) }
            description?.let { appendLine(it) }
            footer?.let { append(it) }
        }
    }

    fun sendTranslatedEmbed(event: SlashCommandInteractionEvent) {
        val fallbackMessage = buildMessage()

        // Detectar idioma do usuário
        val userLocale = event.userLocale?.locale?.lowercase(Locale.ROOT) ?: "en_us"
        val language = when (userLocale) {
            "pt-br" -> "pt_br"
            "es-es" -> "es_es"
            else -> "en_us"
        }

        val translator = Translate(language)
        val translatedNotice = translator.getTranslate(
            "errors", "embed", "fallback_warning"
        ) ?: "**❌ | This message was automatically converted to plain text. Please grant me permission to send embeds.**"

        // Enviar mensagem alternativa + aviso traduzido
        event.reply(fallbackMessage).queue {
            event.hook.sendMessage(translatedNotice).queue()
        }
    }
}
