package studio.styx

import io.github.cdimascio.dotenv.Dotenv
import net.dv8tion.jda.api.JDABuilder
import net.dv8tion.jda.api.requests.GatewayIntent
import studio.styx.erisbot.core.handlers.CommandHandler
import studio.styx.erisbot.core.registers.CommandsRegister

fun main() {
    val dotenv = Dotenv.configure().load()
    val token = dotenv["BOT_TOKEN"] ?: throw IllegalArgumentException("BOT_TOKEN não encontrado no arquivo .env")

    val jda = JDABuilder.createDefault(token)
        .enableIntents(GatewayIntent.values().toList()) // Habilita todas as intents
        .build()

    jda.awaitReady()

    // Registrar os comandos
    val commandsRegister = CommandsRegister()
    commandsRegister.registerCommands(jda)

    // Registrar o CommandHandler como listener
    jda.addEventListener(CommandHandler())

    println("Bot iniciado com sucesso!")
}