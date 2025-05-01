package studio.styx.erisbot.core.handlers

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.events.message.MessageReceivedEvent
import net.dv8tion.jda.api.hooks.ListenerAdapter
import studio.styx.utils.Translate
import java.util.Locale

class EventsHandler : ListenerAdapter {
    fun onMessage(event: MessageReceivedEvent) {
        if (event.message.equals("<@1365785789933551707>" || event.message.equals("<@!1365785789933551707>"))) {
            try {
                val userLocale = event.author..userLocale?.locale?.lowercase(Locale.ROOT) ?: "en_us"
                val language = when (userLocale) {
                    "pt-br" -> "pt_br"
                    "en-us" -> "en_us"
                    "es-es" -> "es_es"
                    else -> "en_us"
                }
                val translator = Translate(language)

                val embed = EmbedBuilder()
                    .setTitle("Olá ${event.author.name}")
                    .setDescription(
                        "## Sobre mim" +
                        "- Sabia que eu sou um bot de código aberto? Você pode ver meu código fonte [aqui](https://github.com/studio-styx/erisbot)\n" +
                        "- Fui criada usando kotlin e JDA, uma biblioteca para interagir com a API do Discord.\n" +
                        "- Estou sempre aprendendo e melhorando, então fique à vontade para me dar feedbacks e sugestões.\n" +
                        "- Sabia que eu falo três idiomas? português, inglẽs e espanhol, posso traduzir meus comandos quando você troca o idioma do seu discord!" +
                        "## Comandos principais" +
                        "`/bot info` - mostra mais sobre mim" +
                        "`/bot commands - mostra meus comandos"
                    )
            }
        }
    }
}