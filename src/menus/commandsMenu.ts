import { settings } from "#settings";
import { icon } from "#utils";
import { brBuilder, createRow } from "@magicyan/discord";
import { EmbedBuilder, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function commandsMenu<R>(commandId: string, page: "economy" | "bot" | "user"): R {
    const embed = new EmbedBuilder({
        title: "Commands",
        color: parseInt(settings.colors.fuchsia.replace("#", ""), 16),
        timestamp: new Date().toISOString(),
    })

    if (page === "economy") {
        embed.addFields({
            name: "",
            value: brBuilder(
                `</economy general work:${commandId}> - work to earn money`,
                `</economy general daily:${commandId}> - claim your daily reward`,
                `</economy general balance:${commandId}> - check your balance`,
                `</economy general deposit:${commandId}> - deposit money into your bank`,
                `</economy general withdraw:${commandId}> - withdraw money from your bank`,
                `</economy general transfer:${commandId}> - transfer money to another user`,
                `</economy general leaderboard:${commandId}> - check the leaderboard`,
            ),
            inline: true
        }, {
            name: "",
            value: brBuilder(
                `</economy cassino slots:${commandId}> - play slots`,
                `</economy cassino coinflip:${commandId}> - play coinflip`,
                `</economy cassino horse-racing:${commandId}> - bet in horse racing`,
            ),
            inline: true
        }, {
            name: "",
            value: brBuilder(
                `</economy investment buy:${commandId}> - buy a stock`,
                `</economy investment own-stocks:${commandId}> - see your own stocks`,
                `</economy investment ia-avaliation:${commandId}> - see the ia avaliation about the stocks`,
            ),
            inline: true
        })
    } else if (page === "bot") {
        embed.addFields({
            name: "",
            value: brBuilder(
                `</bot info:${commandId}> - check bot info`,
                `</bot ping:${commandId}> - check bot ping`,
                `</bot creators:${commandId}> - check bot creators`,
                `</bot commands:${commandId}> - check bot commands`,
            ),
            inline: true
        })
    } else if (page === "user") {
        embed.addFields({
            name: "",
            value: brBuilder(
                `</user logs:${commandId}> - check your logs`,
                `</user avatar:${commandId}> - check your avatar`,
            )
        })
    }

    const components = [
        createRow(
            new StringSelectMenuBuilder({
                customId: "menu/help/commands",
                placeholder: "Select a category",
                options: [
                    { label: "Economy", value: "economy", emoji: icon.money_bag, default: commandId === "economy" },
                    { label: "Bot", value: "bot", emoji: icon.bot, default: commandId === "bot" },
                    { label: "User", value: "user", emoji: icon.investment_graph, default: commandId === "user" },
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