package studio.styx.utils

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.entities.MessageEmbed
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.events.message.MessageReceivedEvent
import net.dv8tion.jda.api.interactions.InteractionHook

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

    fun sendErrorEmbed(event: MessageReceivedEvent, errorMessage: String) {
        val embed = createErrorEmbed(errorMessage)
        event.channel.sendMessageEmbeds(embed).queue(
            {  },
            { error ->
                // Este bloco será executado se houver um erro ao enviar o embed
                event.channel.sendMessage("❌ | Ocorreu um erro ao enviar a mensagem: ${error.message}" +
                        "\n era esperado enviar um embed com o erro: `❌ | ${errorMessage}`").queue()
            }
        )
    }

    fun editDeferWithErrorEmbed(hook: InteractionHook, message: String) {
        hook.editOriginalEmbeds(createErrorEmbed(message)).queue(
            null,
            { error ->
                hook.editOriginal(
                    "❌ | Ocorreu um erro ao editar a mensagem: ${error.message}\n" +
                            "Era esperado enviar um embed com o erro: `❌ | $message`"
                ).queue()
            }
        )
    }


    fun createErrorEmbed(errorMessage: String): MessageEmbed {
        return EmbedBuilder()
            .setDescription("**❌ | $errorMessage**")
            .setColor(colors.red)
            .build()
    }
}