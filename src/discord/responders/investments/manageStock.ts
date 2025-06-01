import { createResponder, ResponderType } from "#base";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { PrismaClient } from "#prisma";
import { createContainer, createRow, createSeparator } from "@magicyan/discord";
import { res, icon } from "#utils";

const prisma = new PrismaClient();

createResponder({
    customId: "investment/manage/:stockId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { stockId }) {
        const id = Number(stockId);
        const stock = await prisma.stock.findUnique({ where: { id } });

        if (!stock) {
            interaction.reply(res.danger(`${icon.error} | Stock not found`));
            return;
        }

        const user = await prisma.user.upsert({
            where: { id: interaction.user.id },
            update: {},
            create: { id: interaction.user.id },
        })

        const holding = await prisma.stockHolding.findUnique({
            where: {
                userId_stockId: {
                    userId: interaction.user.id,
                    stockId: id
                }
            }
        })

        if (!holding) {
            interaction.reply(res.danger(`${icon.error} | You don't have any stocks of this type`));
            return;
        }
    },
});