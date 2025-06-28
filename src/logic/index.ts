import { stocksEventuals } from "./events/stocksVariants.js";

export * from "./generateAi.js"
export * from "./events/stocksVariants.js"
export * from "./battle/fight.js"

export async function startEvents() {
    setInterval(async () => {
        await stocksEventuals()
    }, 1000 * 60 * 60 * 24);
}