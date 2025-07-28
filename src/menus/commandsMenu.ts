import { getCommandId, icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createRow } from "@magicyan/discord";
import { EmbedBuilder, StringSelectMenuBuilder, type InteractionReplyOptions, Interaction } from "discord.js";

export async function commandsMenu<R>(page: "economy" | "bot" | "user" | "moderation", interaction: Interaction): Promise<R> {
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
                    `**</bot creators:${bot}>** - Ver meus criadores`,
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
            const user = await getCommandId(interaction, "user")

            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</user logs:${user}>** - Ver seus registros`,
                    `**</user avatar:${user}>** - Ver seu avatar`,
                )
            })
            break;
        }
        case "moderation": {
            const dashboardCommandId = await getCommandId(interaction, "dashboard")
            embed.addFields({
                name: "",
                value: brBuilder(
                    `**</dashboard:${dashboardCommandId}>** - dashboard`,
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
                    { label: "Economy", value: "economy", emoji: icon.money_bag, default: page === "economy" },
                    { label: "Bot", value: "bot", emoji: icon.bot, default: page === "bot" },
                    { label: "User", value: "user", emoji: icon.investment_graph, default: page === "user" },
                    { label: "Moderation", value: "moderation", emoji: icon.lock, default: page === "moderation" }
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