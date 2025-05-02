package studio.styx.erisbot.core.handlers

import io.github.cdimascio.dotenv.Dotenv
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.exceptions.PermissionException
import net.dv8tion.jda.api.hooks.ListenerAdapter
import net.dv8tion.jda.api.interactions.commands.build.SlashCommandData
import studio.styx.erisbot.core.registers.SlashCommand
import studio.styx.utils.ErrorEmbedUtil
import studio.styx.utils.Translate
import java.io.File
import java.util.Locale

class CommandHandler : ListenerAdapter() {
    private val commands = mutableMapOf<String, SlashCommand>()
    private lateinit var development: String
    private lateinit var dest: String
    private lateinit var path: String

    init {
        val dotenv = Dotenv.configure().load()
        development = dotenv["DEVELOPMENT"] ?: "false"
        dest = if (development == "true") "development" else "erisbot/features"
        path = File("src/main/kotlin/$dest/commands").absolutePath
        loadCommands()
    }

    private fun loadCommands() {

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

        for (file in files) {
            val className = file.name.replace(".kt", "")
            val relativePath = file.parentFile.path
                .replace(File("src/main/kotlin/").absolutePath, "") // Remover o prefixo base
                .replace("/", ".")                              // Substituir barras por pontos
                .replace("\\", ".")                             // Substituir barras invertidas por pontos
                .trim('.')                                      // Remover pontos extras
            val packageName = relativePath
            val fullClassName = if (packageName.isEmpty()) className else "$packageName.$className"

            try {
                println("Carregando comando: $fullClassName")
                val clazz = Class.forName(fullClassName)
                val instance = clazz.getDeclaredConstructor().newInstance()

                if (instance is SlashCommand) {
                    val commandData = instance.getSlashCommandData()
                    commands[commandData.name] = instance
                    println("Comando ${commandData.name} carregado com sucesso")
                }
            } catch (e: Exception) {
                println("Erro ao carregar comando $fullClassName: ${e.message}")
                e.printStackTrace()
            }
        }
        println("Comandos carregados: ${commands.keys}")
    }

    override fun onSlashCommandInteraction(event: SlashCommandInteractionEvent) {
        val commandName = event.name

        val command = commands[commandName] ?: run {
            val errorEmbedUtil = ErrorEmbedUtil()
            errorEmbedUtil.sendErrorEmbed(event, "Comando não encontrado: /$commandName")
            return
        }

        val subcommandName = event.subcommandName
        val subcommandGroup = event.subcommandGroup

        try {
            val commandData = command.getSlashCommandData()
            if (commandData !is SlashCommandData) {
                command.execute(event)
                return
            }

            if (subcommandGroup != null && subcommandName != null) {
                val group = commandData.getSubcommandGroups().find { it.name == subcommandGroup }
                if (group == null) {
                    val errorEmbedUtil = ErrorEmbedUtil()
                    errorEmbedUtil.sendErrorEmbed(event, "Grupo de subcomandos não encontrado: $subcommandGroup")
                    return
                }
                val subcommand = group.subcommands.find { it.name == subcommandName }
                if (subcommand == null) {
                    val errorEmbedUtil = ErrorEmbedUtil()
                    errorEmbedUtil.sendErrorEmbed(event, "Subcomando não encontrado: $subcommandName")
                    return
                }
                command.execute(event)
            } else if (subcommandName != null) {
                val subcommand = commandData.getSubcommands().find { it.name == subcommandName }
                if (subcommand == null) {
                    val errorEmbedUtil = ErrorEmbedUtil()
                    errorEmbedUtil.sendErrorEmbed(event, "Subcomando não encontrado: $subcommandName")
                    return
                }
                command.execute(event)
            } else {
                command.execute(event)
            }
        } catch (e: Exception) {
            val errorEmbedUtil = ErrorEmbedUtil()
            errorEmbedUtil.sendErrorEmbed(event, "Erro ao executar o comando: `${e.message}`")
            e.printStackTrace()
        }
    }
}