package studio.styx.utils

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.entities.MessageEmbed
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import java.awt.Color

class ErrorEmbedUtil {
    fun sendErrorEmbed(event: SlashCommandInteractionEvent, errorMessage: String) {
        val embed = createErrorEmbed(errorMessage)
        event.replyEmbeds(embed)
            .setEphemeral(true)
            .queue(
                {  },
                { error ->
                    // Este bloco será executado se houver um erro ao enviar o embed
                    event.reply("❌ | Ocorreu um erro ao enviar a mensagem: ${error.message}" +
                            "\n era esperado enviar um embed com o erro: `❌ | ${errorMessage}`").setEphemeral(true).queue()
                }
            )
    }

    fun createErrorEmbed(errorMessage: String): MessageEmbed {
        return EmbedBuilder()
            .setDescription("❌ | $errorMessage")
            .setColor(Color.RED)
            .build()
    }
}