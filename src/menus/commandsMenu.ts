import { getCommandId, icon } from "#functions";
import { env, settings } from "#settings";
import { brBuilder, createRow } from "@magicyan/discord";
import { EmbedBuilder, StringSelectMenuBuilder, type InteractionReplyOptions, Interaction } from "discord.js";

export async function commandsMenu<R>(page: "economy" | "bot" | "user" | "moderation" | "utility" | "fun", interaction: Interaction): Promise<R> {
    const embed = new EmbedBuilder({
        title: "Commands",
        color: parseInt(settings.colors.fuchsia.replace("#", ""), 16),
        timestamp: new Date().toISOString(),
    })

    switch (page) {
        case "economy": {
            const [daily, work, bank, leaderboard, jobs, cassino, investment] = await Promise.all([
                getCommandId(interaction, "daily"),
                getCommandId(interaction, "work"),
                getCommandId(interaction, "bank"),
                getCommandId(interaction, "leaderboard"),
                getCommandId(interaction, "jobs"),
                getCommandId(interaction, "cassino"),
                getCommandId(interaction, "investment")
            ])


            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</work:${work}>** - Trabalhar para ganhar dinheiro`,
                    `**</daily:${daily}>** - Ganhar sua recompensa diária`,
                    `**</bank balance:${bank}>** - Verificar seu saldo`,
                    `**</bank deposit:${bank}>** - Depositar seu dinheiro no banco`,
                    `**</bank withdraw:${bank}>** - Retirar seu dinheiro do banco`,
                    `**</bank transfer:${bank}>** - Transferir seu dinheiro para outro usuário`,
                    `**</leaderboard:${leaderboard}>** - Verificar o ranking de usuários mais ricos`,
                    `**</jobs search:${jobs}>** - Procurar por um emprego`,
                    `**</jobs dismiss:${jobs}>** - Sair de seu emprego`,
                ),
                inline: true
            }, {
                name: "",
                value: brBuilder(
                    `**</cassino slots:${cassino}>** - Apostar em caça niqueis`,
                    `**</cassino coinflip:${cassino}>** - Apostar em cara ou coroa`,
                    `**</cassino horse-racing:${cassino}>** - Apostar em corrida de cavalos`,
                    `**</cassino blackjack:${cassino}>** - Apostar no blackjack`,
                ),
                inline: true
            }, {
                name: "",
                value: brBuilder(
                    `**</investment buy:${investment}>** - Comprar uma ação`,
                    `**</investment own-stocks:${investment}>** - Verificar suas ações`,
                    `**</investment stocks:${investment}>** - Ver todas as ações`,
                    `**</investment ia-avaliation:${investment}>** - Pedir avaliação da ia`,
                ),
                inline: true
            })
            break;
        }
        case "bot": {
            const [supportCommandId, bot] = await Promise.all([
                getCommandId(interaction, "suporte"),
                getCommandId(interaction, "bot")
            ])


            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</bot info:${bot}>** - Ver as minhas informações`,
                    `**</bot ping:${bot}>** - Ver meu ping`,
                    `**</bot commands:${bot}>** - Ver meus comandos`,
                    `**</suporte reportar bug:${supportCommandId}>** - Reportar um bug`,
                    `**</suporte reportar usuario:${supportCommandId}>** - Reportar um usuário`,
                    `**</suporte sugestao:${supportCommandId}>** - Fazer uma sugestão`,
                ),
                inline: true
            })
            break;
        }
        case "user": {
            const [user, xp] = await Promise.all([
                getCommandId(interaction, "user"),
                getCommandId(interaction, "xp")
            ])

            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</user logs:${user}>** - Ver seus registros`,
                    `**</user avatar:${user}>** - Ver seu avatar`,
                    `**</xp rank:${xp}>** - Ver o rank de xp dos usuários do servidor`,
                    `**</xp user:${xp}>** - Ver o xp de um usuário`,
                )
            })
            break;
        }
        case "moderation": {
            const [dashboardCommandId, xpCommandId, giveawayCommandId] = await Promise.all([
                getCommandId(interaction, "dashboard"),
                getCommandId(interaction, "xp"),
                getCommandId(interaction, "giveaway")
            ])
            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</dashboard:${dashboardCommandId}>** - dashboard`,
                    `**</xp add:${xpCommandId}>** - Adicionar xp a um usuário`,
                    `**</xp remove:${xpCommandId}>** - Remover xp de um usuário`,
                    `**</xp reset user:${xpCommandId}>** - Resetar o xp de um usuário`,
                    `**</xp reset server:${xpCommandId}>** - Resetar o xp do server`,
                    `**</giveaway create:${giveawayCommandId}>** - Criar um sorteio`,
                    `**</giveaway edit:${giveawayCommandId}>** - Editar um sorteio`,
                    `**</giveaway cancel:${giveawayCommandId}>** - Cancelar um sorteio`,
                    `**</giveaway end:${giveawayCommandId}>** - Finalizar um sorteio mais cedo`,
                    `**</giveaway reroll:${giveawayCommandId}>** - Substituir um ganhador`,
                    `**</giveaway entry:${giveawayCommandId}>** - Colocar o server em um sorteio conectado`,
                )
            })
            embed.setDescription(brBuilder(
                    "Agora a configuração do server fica por parte do site!",
                    "No site é possivel configurar:",
                    "- Chatbot",
                    "- Canais onde pode ser usado comandos",
                    "- Sistema de xp que é possivel configurar:",
                    "> - Dificuldade",
                    "> - Cargos que recebem mais ou menos xp",
                    "> - Cargos que não recebem xp",
                    "> - Canais que recebem mais ou menos xp",
                    "> - Canais que não recebem xp",
                    "> - Canal de aviso de levelUp",
                    "> - Mensagem de aviso de levelUp",
                    "> - Cargos que o usuário receberá se subir de nivel",
                    "> - Canais que o usuário poderá ver se subir de nível",
                    ` Use já o meu dashboard! [Clique aqui!](${env.FRONT_BASE_URL}/guilds${interaction.guildId ? `/${interaction.guildId}` : ""})`
                ))
            break;
        }
        case "utility": {
            const [afk] = await Promise.all([
                getCommandId(interaction, "afk")
            ])

            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</afk set:${afk}>** - Definir seu afk`,
                    `**</afk remove:${afk}>** - Remover seu afk`,
                )
            })
            break;
        }
        case "fun": {
            const [tryvia, fishing, wordle] = await Promise.all([
                getCommandId(interaction, "tryvia"),
                getCommandId(interaction, "fishing"),
                getCommandId(interaction, "wordle"),
            ])

            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</tryvia start:${tryvia}>** - Começar um jogo de trivia no canal atual`,
                    `**</tryvia close:${tryvia}>** - Finaliza um jogo de trivia antecipadamente no canal \`(requer perms: gerenciar servidor ou gerenciar canais, ou ser o dono do jogo)\``,
                    `**</fishing fish:${fishing}>** - Começar a pescar`,
                    `**</fishing inventory:${fishing}>** - Ver o inventário de peixes`,
                    `**</fishing sell:${fishing}>** - Vender um peixe do inventário`,
                    `**</fishing fishing_rod_buy:${fishing}>** - Comprar uma vara de pesca`,
                    `**</wordle:${wordle}>** - Começar uma partida de termo`
                )
            })
            break;
        }
    }

    const components = [
        createRow(
            new StringSelectMenuBuilder({
                customId: "menu/help/commands",
                placeholder: "Select a category",
                options: [
                    { label: "Economia", value: "economy", emoji: icon.money_bag, default: page === "economy" },
                    { label: "Bot", value: "bot", emoji: icon.bot, default: page === "bot" },
                    { label: "Usuário", value: "user", emoji: icon.investment_graph, default: page === "user" },
                    { label: "Moderação", value: "moderation", emoji: icon.security, default: page === "moderation" },
                    { label: "Utilidades", value: "utility", emoji: icon.key, default: page === "utility" },
                    { label: "Diversão", value: "fun", emoji: icon.Eris_happy, default: page === "fun" }
                ]
            })
        )
    ]

    return ({
        flags,
        embeds: [embed],
        components
    } satisfies InteractionReplyOptions) as R;
}