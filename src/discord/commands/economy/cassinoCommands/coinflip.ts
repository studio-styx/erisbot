import { prisma } from "#database";
import { res, icon, registerLog, calculateProbability } from "#functions";
import { Rarity } from "#prisma";
import { ChatInputCommandInteraction } from "discord.js";

export async function coinflipCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;
    let amount = options.getNumber("amount", true);
    const side = options.getString("side", true) as 'heads' | 'tails';

    const user = await prisma.user.findUnique({
        where: { id: author.id },
        include: {
            activePet: {
                include: {
                    pet: true,
                    skills: { include: { skill: true } }
                }
            }
        }
    });

    if (!user || user.money.toNumber() < 15) {
        interaction.reply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
        return;
    }

    if (user.money.toNumber() < amount) amount = user.money.toNumber();

    const coinflipLuckSkill = user.activePet?.skills.find(s => s.skill.name === "coinflip_luck");

    const baseChance = 0.5;

    const rarityLuckBonus: Record<Rarity, number> = {
        COMUM: 0.02,       // +2%
        UNCOMUM: 0.04,     // +4%
        RARE: 0.06,        // +6%
        EPIC: 0.08,        // +8%
        LEGENDARY: 0.10,   // +10%
    }

    let totalChance = baseChance;

    if (coinflipLuckSkill && user.activePet) {
        totalChance += rarityLuckBonus[user.activePet.pet.rarity] + (coinflipLuckSkill.level * 0.05);
    }

    totalChance = Math.min(totalChance, 0.7);

    let coinflipResult: string;
    coinflipResult = calculateProbability(totalChance) ? 'heads' : 'tails';

    if (coinflipResult === side) {
        const coinflipBonus = user.activePet?.skills.find(s => s.skill.name === "coinflip_bonus");

        const rarityAmountBonus: Record<Rarity, number> = {
            COMUM: 0.4,
            UNCOMUM: 0.6,
            RARE: 0.8,
            EPIC: 1.2,
            LEGENDARY: 1.5
        }

        const baseAmount = 0.2;

        let totalAmount = baseAmount;


        if (coinflipBonus && user.activePet) {
            totalAmount += (rarityAmountBonus[user.activePet.pet.rarity] + (coinflipBonus.level * 0.05));
        }

        totalAmount = Math.min(totalAmount, 2.5);

        const wonValue = amount * totalAmount;

        interaction.reply(res.success(`${icon.Eris_enchanted} | A moeda caiu em ${side === "heads" ? "cara" : "coroa"}, você ganhou **${wonValue}** STX!`));
        await prisma.user.update({
            where: { id: author.id },
            data: { money: { increment: wonValue } }
        });
        await registerLog({
            level: 6,
            message: `Apostou na moeda do lado ${side} e ganhou ${wonValue} stx`,
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