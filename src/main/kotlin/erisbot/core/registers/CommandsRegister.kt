package studio.styx.erisbot.core.registers

import io.github.cdimascio.dotenv.Dotenv
import net.dv8tion.jda.api.JDA
import net.dv8tion.jda.api.interactions.commands.build.CommandData
import java.io.File

class CommandsRegister {
    private var development: String

    init {
        val dotenv = Dotenv.configure().load()
        development = dotenv["DEVELOPMENT"] ?: "false"
    }

    private val dest = if (development == "true") "development" else "erisbot/features"
    private val path = File("src/main/kotlin/$dest/commands").absolutePath

    fun registerCommands(jda: JDA) {

        val commandDir = File(path)
        if (!commandDir.exists() || !commandDir.isDirectory) {
            println("Diretório de comandos não encontrado: $path")
            return
        }

        val files = commandDir.walk()
            .filter { it.isFile && it.extension == "kt" }
            .toList()

        if (files.isEmpty()) {
            println("Nenhum arquivo .kt encontrado em: $path")
        }

        val commands = files.filter { file ->
            val content = file.readText()
            content.contains("class") && content.contains("execute") && content.contains("getSlashCommandData")
        }

        for (command in commands) {
            val className = command.name.replace(".kt", "")
            val relativePath = command.parentFile.path
                .replace(File("src/main/kotlin/").absolutePath, "") // Remover o prefixo base
                .replace("/", ".")
                .replace("\\", ".")
                .trim('.')
            val packageName = relativePath
            val fullClassName = if (packageName.isEmpty()) className else "$packageName.$className"

            try {
                println("Tentando carregar classe: $fullClassName")
                val clazz = Class.forName(fullClassName)
                val instance = clazz.getDeclaredConstructor().newInstance()

                if (instance is SlashCommand) {
                    val commandData = instance.getSlashCommandData()
                    if (development == "true") {
                        jda.getGuildById("1172930138770526248")?.upsertCommand(commandData)?.queue()
                        println("Registering command ${commandData.name} in development mode")
                    } else {
                        jda.upsertCommand(commandData).queue()
                        println("Registering command ${commandData.name} in production mode")
                    }
                }
            } catch (e: Exception) {
                println("Erro ao carregar classe $fullClassName: ${e.message}")
                e.printStackTrace()
            }
        }
    }
}

interface SlashCommand {
    fun execute(event: net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent)
    fun getSlashCommandData(): CommandData
}