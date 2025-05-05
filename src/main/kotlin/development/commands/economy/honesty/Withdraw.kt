package development.commands.economy.honesty

import net.dv8tion.jda.api.EmbedBuilder
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
import org.jetbrains.exposed.sql.transactions.transaction
import studio.styx.erisbot.core.repository.UserRepository
import studio.styx.utils.ErrorEmbedUtil
import studio.styx.utils.colors
import java.awt.Color

class Withdraw {
    fun execute (event: SlashCommandInteractionEvent) {
        event.deferReply().queue { hook ->
            try {
                var amount = event.getOption("amount")?.asDouble ?: 0.0

                if (amount <= 0) {
                    hook.editOriginal("O valor deve ser maior que zero.").queue()
                    return@queue
                }

                val userRepo = UserRepository(event.user.id)

                transaction {
                    val currentMoney = userRepo.getMoney()
                    amount = amount.coerceAtMost(currentMoney)

                    if (amount > 0) {
                        userRepo.withdraw(amount)
                    }
                }

                if (amount == 0.0) {
                    ErrorEmbedUtil().editDeferWithErrorEmbed(hook, "Você não tem dinheiro suficiente para sacar.")
                }

                val embed1 = EmbedBuilder().apply {
                    setAuthor(event.user.effectiveName, null, event.user.avatarUrl)
                    setDescription("""
                        ### Você sacou **$amount** moedas da sua conta bancária.
                    """.trimIndent())
                    setColor(Color.white)
                    setTimestamp(java.time.Instant.now())
                }
                val embed2 = EmbedBuilder().apply {
                    addField("Carteira", "⤷**Saldo atual:** ${userRepo.getMoney()} moedas", true)
                    addField("Banco", "⤷**Saldo bancário atual:** ${userRepo.getBank()} moedas", true)
                    setColor(colors.pink)
                }

                hook.editOriginalEmbeds(embed1.build(), embed2.build()).queue()
            } catch (e: Exception) {
                ErrorEmbedUtil().editDeferWithErrorEmbed(
                    hook,
                    "Erro ao processar saque: ${e.message}"
                )
                e.printStackTrace()
            }
        }
    }
}