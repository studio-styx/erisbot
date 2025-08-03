import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function coinflipCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;
    let amount = options.getNumber("amount", true);
    const side = options.getString("side", true) as 'heads' | 'tails';

    const user = await prisma.user.findUnique({ where: { id: author.id } });

    if (!user || user.money.toNumber() < 15) {
        interaction.reply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
        return;
    }

    if (user.money.toNumber() < amount) amount = user.money.toNumber();

    let coinflipResult: string;
    coinflipResult = Math.random() < 0.5 ? 'heads' : 'tails';

    if (coinflipResult === side) {
        interaction.reply(res.success(`${icon.Eris_enchanted} | A moeda caiu em ${side === "heads" ? "cara" : "coroa"}, você ganhou **${amount}** STX!`));
        await prisma.user.update({
            where: { id: author.id },
            data: { money: { increment: amount * 0.2 } }
        });
        await registerLog({
            level: 6,
            message: `Apostou na moeda do lado ${side} e ganhou ${amount * 0.2} stx`,
            tags: ["cassino", "transaction", "coinflip", "sum"],
            type: "info",
            user: author.id
        });
        return;
    } else {
        interaction.reply(res.danger(`${icon.Eris_shy} | A moeda caiu em ${coinflipResult}, você perdeu **${amount}** STX!`));
        await prisma.user.update({
            where: { id: author.id },
            data: { money: { decrement: amount } }
        });
        await registerLog({
            level: 6,
            message: `Apostou na moeda do lado ${side} e perdeu ${amount} stx`,
            type: "info",
            tags: ["cassino", "transaction", "coinflip", "sub"],
            user: author.id
        });
        return;
    }
}