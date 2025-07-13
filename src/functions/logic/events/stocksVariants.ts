import { PrismaClient } from '#prisma'

const prisma = new PrismaClient()

export async function stocksEventuals() {
    const stocks = await prisma.stock.findMany()

    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i]
        const { id, price, trend, name } = stock

        let chance = Math.random()
        let shouldIncrease: boolean

        if (trend === 'up') {
            shouldIncrease = chance <= 0.64
        } else if (trend === 'down') {
            shouldIncrease = chance > 0.64
        } else {
            shouldIncrease = chance < 0.5
        }

        // Variação entre 1% e 5% do preço atual
        const variationPercent = (Math.random() * 4 + 1) / 100
        const variationAmount = price.toNumber() * variationPercent
        const newPrice = shouldIncrease
            ? price.toNumber() + variationAmount
            : Math.max(1, price.toNumber() - variationAmount)

        await prisma.stock.update({
            where: { id },
            data: { price: parseFloat(newPrice.toFixed(2)) }
        })

        await prisma.stockHistory.create({
            data: {
                stockId: id,
                price: parseFloat(newPrice.toFixed(2))
            }
        })

        console.log(`Stock ${id} - ${name} | old price: ${price.toNumber()} new price: ${newPrice.toFixed(2)}`)
    }
}
