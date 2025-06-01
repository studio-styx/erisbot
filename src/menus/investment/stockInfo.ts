import { Prisma } from '#prisma'
import { settings } from '#settings'
import { brBuilder, createContainer, createRow, createSeparator } from '@magicyan/discord'
import { createCanvas } from '@napi-rs/canvas'
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
    const canvas = createCanvas(900, 440)
    const ctx = canvas.getContext('2d')

    const colors = {
        background: "#242424",
        title: "#e6e6e6",
        white: "#ffffff",
        numbersAndDates: "#a6a6a6",
        lineUp: "#00bf63",
        lineDown: "#cd2828",
        whatermark: "#4d4d4d",
        biggerValue: "#ffde59",
        smallerValue: "#ff3131",
        actualPrice: "#004aad",
        actualAndBiggerValue: "#d336c6",
        actualAndSmallerValue: "#85464a",
    }

    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = colors.title
    ctx.font = 'bold 40px Sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(stock.name.toUpperCase(), canvas.width / 2, 60)

    const graphArea = {
        top: 100,
        left: 70,
        right: 860,
        bottom: 380,
        width: 860 - 70,
        height: 380 - 100
    }

    const history = [...originalHistory].reverse()

    let displayedHistory: History[]
    if (history.length <= 35) {
        displayedHistory = history
    } else {
        const chunkSize = Math.floor(history.length / 35)
        displayedHistory = []

        for (let i = 0; i < 35; i++) {
            const start = i * chunkSize
            const end = i === 34 ? history.length : start + chunkSize
            const chunk = history.slice(start, end)

            const mostRecent = chunk[chunk.length - 1]
            const min = chunk.reduce((a, b) => (a.price < b.price ? a : b))
            const max = chunk.reduce((a, b) => (a.price > b.price ? a : b))

            const selected = [min, max, mostRecent].find(item => !displayedHistory.includes(item)) || mostRecent
            displayedHistory.push(selected)
        }
    }

    const prices = displayedHistory.map(h => h.price)
    const dates = displayedHistory.map(h => h.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))
    const maxPrice = Math.max(...prices.map(p => Number(p)))
    const minPrice = Math.min(...prices.map(p => Number(p)))

    const xStep = graphArea.width / (displayedHistory.length - 1)
    const yScale = graphArea.height / (maxPrice - minPrice)

    // Traçar as linhas
    for (let i = 0; i < displayedHistory.length - 1; i++) {
        const x1 = graphArea.left + i * xStep
        const y1 = graphArea.bottom - (displayedHistory[i].price.toNumber() - minPrice) * yScale
        const x2 = graphArea.left + (i + 1) * xStep
        const y2 = graphArea.bottom - (displayedHistory[i + 1].price.toNumber() - minPrice) * yScale

        ctx.strokeStyle = displayedHistory[i + 1].price >= displayedHistory[i].price ? colors.lineUp : colors.lineDown
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
    }

    // Regras para mostrar os números no gráfico
    const shouldShowAll = displayedHistory.length <= 12
    const dynamicStep = Math.max(4, Math.floor(displayedHistory.length / 8))

    for (let i = 0; i < displayedHistory.length; i++) {
        const h = displayedHistory[i]
        const x = graphArea.left + i * xStep
        const y = graphArea.bottom - (h.price.toNumber() - minPrice) * yScale

        let pointColor = colors.white
        const isMax = h.price.toNumber() === maxPrice
        const isMin = h.price.toNumber() === minPrice
        const isLast = i === displayedHistory.length - 1
        const isFirst = i === 0
        const isActual = h.price === stock.price

        if (isMax && isActual) pointColor = colors.actualAndBiggerValue
        else if (isMin && isActual) pointColor = colors.actualAndSmallerValue
        else if (isMax) pointColor = colors.biggerValue
        else if (isMin) pointColor = colors.smallerValue
        else if (isActual) pointColor = colors.actualPrice

        ctx.beginPath()
        ctx.fillStyle = pointColor
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = colors.white
        ctx.lineWidth = 2
        ctx.stroke()

        const shouldDisplayText = shouldShowAll || isFirst || isLast || isMax || isMin || (i % dynamicStep === 0)

        if (shouldDisplayText) {
            ctx.fillStyle = colors.white
            ctx.font = 'bold 16px Sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(h.price.toFixed(2), x, y - 15)

            ctx.fillStyle = colors.numbersAndDates
            ctx.font = '14px Sans-serif'
            ctx.fillText(dates[i], x, graphArea.bottom + 20)
        }
    }

    // Linha branca horizontal inferior
    ctx.strokeStyle = colors.white
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(graphArea.left, graphArea.bottom + 5)
    ctx.lineTo(graphArea.right, graphArea.bottom + 5)
    ctx.stroke()

    // Linha branca vertical à esquerda
    ctx.beginPath()
    ctx.moveTo(graphArea.left - 10, graphArea.top)
    ctx.lineTo(graphArea.left - 10, graphArea.bottom + 5)
    ctx.stroke()

    // Eixo Y com valores
    ctx.fillStyle = colors.numbersAndDates
    ctx.textAlign = 'right'
    ctx.font = '14px Sans-serif'
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
        const price = minPrice + ((maxPrice - minPrice) / ySteps) * i
        const y = graphArea.bottom - (price - minPrice) * yScale
        ctx.fillText(price.toFixed(0), graphArea.left - 10, y + 5)
    }

    // Marca d'água
    ctx.fillStyle = colors.whatermark
    ctx.font = 'bold 90px Sans-serif'
    ctx.textAlign = 'center'
    ctx.globalAlpha = 0.13
    ctx.fillText('ErisBot', canvas.width / 2, canvas.height / 2 + 30)
    ctx.globalAlpha = 1

    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'stock-info.png' })

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
