import { res, icon } from "#functions";
import { Prisma } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

interface Stocks {
    id: number;
    name: string;
    price: Prisma.Decimal;
    description: string | null;
}

export function stocksMenu<R>(allStocks: Stocks[], page: number = 0): R {
    const stocksPerPage = 6;
    const startIndex = page * stocksPerPage;
    const endIndex = startIndex + stocksPerPage;
    const stocks = allStocks.slice(startIndex, endIndex);

    if (!stocks || stocks.length === 0) {
        return res.danger(`${icon.error} | You don't have any stocks`) as R;
    }

    const components: any[] = [
        brBuilder(
            "## Toda as ações disponiveis para compra"
        ),
        createSeparator()
    ];

    stocks.forEach((stock, index) => {
        components.push(
            createSection({
                content: brBuilder(
                    `${startIndex + index + 1}. **${stock.name}**`,
                    `> **Valor atual:** Ꞩ ${stock.price}`,
                    `> **Descrição:** ${stock.description ?? "Nenhuma descrição disponivel"}`
                ),
                button: new ButtonBuilder({
                    customId: `investment/info/${stock.id}`,
                    label: "Saber mais",
                    style: ButtonStyle.Primary
                })
            })
        )
        if (index !== stocks.length - 1) {
            components.push(
                createSeparator()
            )
        }
    })

    const container = createContainer({
        accentColor: settings.colors.danger,
        components,
    });

    const row = createRow(
        new ButtonBuilder({
            customId: `investment/menu/allStocks/${page - 1}`,
            label: "Anterior",
            style: ButtonStyle.Secondary,
            disabled: page === 0
        }),
        new ButtonBuilder({
            customId: `investment/menu/allStocks/${page + 1}`,
            label: "Próximo",
            style: ButtonStyle.Primary,
            disabled: endIndex >= allStocks.length
        })
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row]
    } satisfies InteractionReplyOptions) as R;
}