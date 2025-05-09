import { settings } from "#settings";
import { brBuilder, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, StringMappedInteractionTypes, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function commandsMenu<R>(commandId: string, page: "economy" | "bot" | "adventure"): R {
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
                `</economy general shop:${commandId}> - check the shop`,
            ),
            inline: true
        }, {
            name: "",
            value: brBuilder(
                `</economy cassino roulette:${commandId}> - play roulette`,
                `</economy cassino slots:${commandId}> - play slots`,
                `</economy cassino blackjack:${commandId}> - play blackjack`,
                `</economy cassino coinflip:${commandId}> - play coinflip`,
                `</economy dishonest rob:${commandId}> - rob another`,
                `</economy dishonest scam:${commandId}> - scam another`,
            ),
            inline: true
        })
    } else if (page === "bot") {
        embed.addFields({
            name: "",
            value: brBuilder(
                `</bot info:${commandId}> - check bot info`,
                `</bot ping:${commandId}> - check bot ping`,
                `</bot support:${commandId}> - check support server`,
                `</bot invite:${commandId}> - check bot invite`,
                `</bot creators:${commandId}> - check bot creators`,
                `</bot commands:${commandId}> - check bot commands`,
            ),
            inline: true
        })
    }

    const components = [
        createRow(
            new StringSelectMenuBuilder({
                customId: "menu/help/commands",
                placeholder: "Select a category",
                options: [
                    { label: "Economy", value: "economy" },
                    { label: "Bot", value: "bot" },
                    { label: "Adventure", value: "adventure" },
                    { label: "Fun", value: "fun" },
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