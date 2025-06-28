import { createResponder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";
import { PrismaClient } from "#prisma"
import { icon, res } from "#utils";

const prisma = new PrismaClient();

createResponder({
    customId: "investment/buyStock/:stockId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { stockId }) {
        const stock = await prisma.stock.findUnique({ where: { id: Number(stockId) } });

        const user = await prisma.user.upsert({
            where: { id: interaction.user.id },
            update: {},
            create: { id: interaction.user.id },
        })

        if (!stock) {
            interaction.reply(res.danger(`${icon.error} | Stock not found`));
            return;
        }
        
        const maxLength = Math.floor(user.money.toNumber() / stock.price.toNumber());

        if (interaction.isButton()) {
            if (maxLength < 1) {
                interaction.reply(res.danger(`${icon.error} | You can't buy any stocks, please witdraw from your bank`));
                return;
            }

            interaction.showModal({
                customId: `investment/buyStock/${stockId}`,
                title: "Buy Stock",
                components: createModalFields({
                    response: {
                        label: "amount",
                        placeholder: "amount to buy here",
                        style: TextInputStyle.Short,
                        required: true,
                        minLength: 1,
                        maxLength: maxLength < 1 ? 1 : maxLength
                    },
                }),
            });
        } else {
            await interaction.deferReply({ flags });

            const amount = Number(interaction.fields.getTextInputValue("response"));

            if (amount > maxLength) {
                interaction.editReply(`You can't buy more than ${maxLength} stocks`);
                return;
            }

            await prisma.user.update({
                where: { id: interaction.user.id },
                data: {
                    money: { decrement: stock.price.toNumber() * amount },
                }
            })

            await prisma.stockHolding.upsert({
                where: {
                    userId_stockId: {
                        stockId: Number(stockId),
                        userId: interaction.user.id
                    }
                },
                create: {
                    stockId: Number(stockId),
                    userId: interaction.user.id,
                    amount
                },
                update: {
                    amount: { increment: amount }
                },
            })

            interaction.editReply(res.success(`${icon.success} | You bought **${amount}** stocks of \`${stock.name}\``));
        }
        return;
    },
});