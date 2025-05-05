package studio.styx.development.commands.adminCommands.database

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import net.dv8tion.jda.api.interactions.InteractionHook
import studio.styx.logic.DatabaseManager
import java.awt.Color

class BrutQuery {
    fun execute(event: SlashCommandInteractionEvent, hook: InteractionHook, query: String) {
        val embed = EmbedBuilder()
            .setTitle("Query Results")
            .setAuthor(event.user.effectiveName, event.user.avatarUrl)
            .addField("Query Executada", "```sql\n$query\n```", false)
            .setTimestamp(java.time.Instant.now())

        try {
            val result = DatabaseManager.executeRawQuery(query)

            when (result["status"]) {
                "success" -> {
                    embed.setColor(Color.GREEN)

                    if (result.containsKey("data")) {
                        val data = result["data"] as List<Map<String, Any?>>
                        val formattedResults = formatResults(data)
                        embed.addField("Resultados", "```json\n$formattedResults\n```", false)
                    } else {
                        embed.addField("Status", "```bash\n✅ Query executada com sucesso\n```", false)
                    }
                }
                "not found" -> {
                    embed.setColor(Color.YELLOW)
                    embed.addField("Status", "⚠️ Nenhum resultado encontrado", false)
                }
                else -> {
                    embed.setColor(Color.RED)
                    embed.addField("Erro", "```\n${result["message"]}\n```", false)
                }
            }
        } catch (e: Exception) {
            embed.setColor(Color.RED)
            embed.addField("Erro Fatal", "```\n${e.message}\n```", false)
        }

        hook.editOriginalEmbeds(embed.build()).queue()
    }

    private fun formatResults(data: List<Map<String, Any?>>): String {
        return if (data.isEmpty()) {
            "[]"
        } else {
            val sb = StringBuilder()
            sb.append("[\n")
            data.forEachIndexed { index, row ->
                sb.append("  {\n")
                row.forEach { (key, value) ->
                    sb.append("    \"$key\": ${formatValue(value)},\n")
                }
                // Remove a última vírgula
                if (row.isNotEmpty()) {
                    sb.deleteCharAt(sb.length - 2)
                }
                sb.append("  }${if (index < data.size - 1) "," else ""}\n")
            }
            sb.append("]")
            sb.toString()
        }
    }

    private fun formatValue(value: Any?): String {
        return when (value) {
            null -> "null"
            is String -> "\"$value\""
            else -> value.toString()
        }
    }
}