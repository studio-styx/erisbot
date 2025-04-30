package development.commands

import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import net.dv8tion.jda.api.interactions.commands.build.Commands
import studio.styx.erisbot.core.registers.SlashCommand

class Ping : SlashCommand {
    override fun execute(event: SlashCommandInteractionEvent) {
        println("Executando comando /ping")
        event.reply("Pong!").queue()
    }

    override fun getSlashCommandData(): CommandData {
        return Commands.slash("ping", "Testa a latência do bot")
    }
}