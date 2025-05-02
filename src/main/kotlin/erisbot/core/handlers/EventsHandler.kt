package studio.styx.erisbot.core.handlers

import io.github.cdimascio.dotenv.Dotenv
import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.events.message.MessageReceivedEvent
import net.dv8tion.jda.api.exceptions.PermissionException
import net.dv8tion.jda.api.hooks.ListenerAdapter
import studio.styx.utils.ErrorEmbedUtil
import java.awt.Color

class EventsHandler : ListenerAdapter() {
    private var development: String

    init {
        val dotenv = Dotenv.configure().load()
        development = dotenv["DEVELOPMENT"] ?: "false"
    }

    override fun onMessageReceived(event: MessageReceivedEvent) {
        if (event.message.contentRaw == "<@1365785789933551707>" || event.message.contentRaw == "<@!1365785789933551707>") {
            val botCommandId = if (development == "false") {
                event.jda.retrieveCommands().complete()
                    .find { it.name == "bot" }?.id
            } else {
                event.guild?.retrieveCommands()?.complete()
                    ?.find { it.name == "bot" }?.id
            }

            if (botCommandId == null) {
                ErrorEmbedUtil().sendErrorEmbed(event, "❌ | Não encontrei o comando /bot")
                return
            }

            try {
                val embed = EmbedBuilder()
                    .setDescription(
                        "### Olá, eu sou a Éris! um bot de código aberto criado para ajudar você a se divertir\n" +
                                "</bot info:$botCommandId> - veja mais sobre mim\n" +
                                "</bot commands:$botCommandId> - veja meus comandos!"
                    )
                    .setColor(Color.decode("#FF69B4"))
                    .setAuthor("Olá ${event.author.effectiveName}", event.author.avatarUrl)

                event.channel.sendMessageEmbeds(embed.build()).queue()
            } catch (e: PermissionException) {
                if (e.permission.getName() == "MessageEmbed") {
                    val message = "### Olá, eu sou a Éris! um bot de código aberto criado para ajudar você a se divertir\n" +
                            "</bot info:$botCommandId> - veja mais sobre mim\n" +
                            "</bot commands:$botCommandId> - veja meus comandos!"


                    val messageFollowUp = "❌ | Eu não tenho permissões para enviar embeds. Para uma melhor experiência, me dê permissão para enviar embeds."

                    event.channel.sendMessage(message).queue()
                    event.channel.sendMessage(messageFollowUp).queue()
                } else {
                    ErrorEmbedUtil().sendErrorEmbed(event, "❌ | Ocorreu um erro ao enviar a mensagem: ${e.message}")
                }
            } catch (e: Exception) {
                ErrorEmbedUtil().sendErrorEmbed(event, "❌ | Ocorreu um erro ao enviar a mensagem: ${e.message}")
            }
        }
    }
}
