package development.menus

data class HelpMenuItem(
    val title: String,
    val description: String,
    val footers: List<Footer>? = null,
    val selectMenuName: String? = null,
    val selectMenuDescription: String? = null
)

data class Footer(
    val title: String,
    val description: String
    val inline: Boolean? = true
)


class HelpMenu(commandId: String) {

    private val menuItems = listOf(
        HelpMenuItem(
            title = "Economia",
            description = "Aqui está meus comandos de economia",
            footers = listOf(
                Footer(
                    title = "",
                    description = """
                        </economy general balance:$commandId> - veja seu saldo
                        </economy general deposit:$commandId> - deposite dinheiro
                        </economy general withdraw:$commandId> - retire dinheiro
                        </economy general work:$commandId> - trabalhe
                        </economy general daily:$commandId> - receba seu daily
                    """.trimIndent(),
                ),
                Footer(
                    title = "",
                    description = """
                        </economy dishonest rob:$commandId> - roube algo ou alguem
                        </economy dishonest scam:$commandId> - aplique um golpe em alguém
                    """.trimIndent()
                ),
                Footer(
                    title = "",
                    description = """
                        </economy cassino slots:$commandId> - jogue caça niqueis
                        </economy cassino blackjack:$commandId> - jogue blackjack
                        </economy cassino roullete:$commandId> - jogue roleta
                    """.trimIndent()
                )
            ),
            selectMenuName = "Economy commands",
            selectMenuDescription = "see my economy commands"
        )
    )
}