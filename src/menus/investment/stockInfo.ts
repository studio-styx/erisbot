import { createGraphic } from '#functions'
import { Prisma } from '#prisma'
import { settings } from '#settings'
import { brBuilder, createContainer, createRow, createSeparator } from '@magicyan/discord'
import { AttachmentBuilder, ButtonBuilder, ButtonStyle, InteractionReplyOptions } from 'discord.js'

interface History {
    price: Prisma.Decimal
    date: Date
}

interface Stock {
    id: number
    name: string
    price: Prisma.Decimal
    description: string | null
    iaAvaliation: string | null
}

export async function stockInfoMenu<R>(stock: Stock, originalHistory: History[]): Promise<R> {
    const image = await createGraphic(stock, originalHistory)

    const attachment = new AttachmentBuilder(image, { name: 'stock-info.png' })

    const components = [
        brBuilder(
            `# ${stock.name}`,
            `> **Descrição**: ${stock.description || "No description"}`,
            `> **Avaliação da IA**: ${stock.iaAvaliation || "No IA avaliation"}`,
            `> **Price**: \`$${stock.price.toFixed(2)}\``,
            `> **Id**: \`${stock.id}\``
        ),
        createSeparator(),
        attachment
    ]

    const row = createRow(
        new ButtonBuilder({
            customId: `investment/advancedAvaliation/${stock.id}`,
            label: "Avaliação Avançada por IA",
            style: ButtonStyle.Primary,
            emoji: "🔮"
        }),
        new ButtonBuilder({
            customId: `investment/buyStock/${stock.id}`,
            label: "Comprar",
            style: ButtonStyle.Success,
            emoji: "💵"
        })
    )

    const container = createContainer({
        accentColor: settings.colors.fuchsia,
        components
    })

    return {
        flags: ["Ephemeral", "IsComponentsV2"],
        files: [attachment],
        components: [container, row]
    } satisfies InteractionReplyOptions as R
}
