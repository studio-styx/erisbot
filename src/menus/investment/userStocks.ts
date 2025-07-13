import { Prisma } from "#prisma/client";
import { settings } from "#settings";
import { icon, res } from "functions/utils/index.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

interface Stocks {
    id: number;
    stockId: number;
    userId: string;
    amount: number;
    stock: {
        id: number;
        name: string;
        price: Prisma.Decimal;
        description: string | null;
    }
};


export function userStocksMenu<R>(allStocks: Stocks[], page: number = 0): R {
    const stocksPerPage = 6;
    const startIndex = page * stocksPerPage;
    const endIndex = startIndex + stocksPerPage;
    const stocks = allStocks.slice(startIndex, endIndex);

    if (!stocks || stocks.length === 0) {
        return res.danger(`${icon.error} | You don't have any stocks`) as R;
    }

    const components: any[] = [
        brBuilder(
            "## Suas ações",
            "-# ╰ Aqui está uma lista de todas as suas ações compradas"
        ),
        createSeparator()
    ];

    stocks.forEach((stock, index) => {
        components.push(
            createSection({
                content: brBuilder(
                    `${startIndex + index + 1}. **${stock.stock.name}**`,
                    `> **Quantidade:** ${stock.amount}`,
                    `> **Valor atual:** Ꞩ ${stock.stock.price}`,
                    `> **Preço de venda (tudo):** Ꞩ ${stock.stock.price.toNumber() * stock.amount}`
                ),
                button: new ButtonBuilder({
                    customId: `investment/manage/${stock.stockId}/info`,
                    label: "Gerenciar ação",
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
        accentColor: settings.colors.fuchsia,
        components,
    });

    const row = createRow(
        new ButtonBuilder({
            customId: `investment/menu/userStocks/${page - 1}`,
            label: "Anterior",
            style: ButtonStyle.Secondary,
            disabled: page === 0
        }),
        new ButtonBuilder({
            customId: `investment/menu/userStocks/${page + 1}`,
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