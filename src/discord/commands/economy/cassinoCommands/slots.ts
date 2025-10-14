import { prisma } from "#database";
import { res, registerLog } from "#functions";
import { getLang, translate } from "#locale";
import { Rarity } from "#prisma";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";

export async function slotsCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author, locale } = interaction;

    const lang = getLang(locale);
    const t = translate.commands.slots[lang];

    let amount = options.getNumber("amount", true);
    await interaction.deferReply({ flags });

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

    if (!user || user.money.toNumber() < 25) {
        interaction.editReply(res.danger(t.notEnoughMoney));
        return;
    }

    if (user.money.toNumber() < amount) amount = user.money.toNumber();

    const { activePet } = user;

    const slotsLuckySkill = activePet?.skills.find(s => s.skill.name === "slots_luck");

    // BÔNUS por raridade (valores adicionais)
    const rarityBonus: Record<Rarity, number> = {
        COMUM: 0.05,       // +5%
        UNCOMUM: 0.1,      // +10%
        RARE: 0.15,        // +15%
        EPIC: 0.2,         // +20%
        LEGENDARY: 0.25,   // +25%
    }

    const slots = ["🍒", "🍊", "🍋", "🍉", "🍇", "🍓", "🍎", "🍐"];

    // Chance base SEM pet
    const baseChance = 0.15; // 15% base

    // Calcula chance total
    let totalChance = baseChance;

    if (slotsLuckySkill && activePet) {
        // Adiciona: bônus da raridade + bônus do nível da skill
        totalChance += rarityBonus[activePet.pet.rarity] + (slotsLuckySkill.level * 0.05);
    }

    const finalChance = Math.min(totalChance, 0.6);

    const isForcedJackpot = Math.random() < finalChance;
    let slot1: string, slot2: string, slot3: string;

    if (isForcedJackpot) {
        const winningSymbol = slots[Math.floor(Math.random() * slots.length)];
        slot1 = slot2 = slot3 = winningSymbol;
    } else {
        slot1 = slots[Math.floor(Math.random() * slots.length)];
        slot2 = slots[Math.floor(Math.random() * slots.length)];
        slot3 = slots[Math.floor(Math.random() * slots.length)];
    }

    const isWin = slot1 === slot2 && slot2 === slot3;

    // Embed inicial
    const embed = createEmbed({
        title: t.embed.title,
        description: t.embed.description.slot1(slot1),
        color: settings.colors.primary
    });

    await interaction.editReply({ embeds: [embed] });

    // Animação em 3 etapas
    setTimeout(async () => {
        embed.setDescription(t.embed.description.slot2(slot1, slot2));
        await interaction.editReply({ embeds: [embed] });

        setTimeout(async () => {
            const winAmount = amount * 0.6;

            embed.setDescription(isWin ? t.embed.description.winMessage(slot1, slot2, slot3, winAmount)
                : t.embed.description.loseMessage(slot1, slot2, slot3, amount));
            embed.setColor(isWin ? "#2ecc71" : "#e74c3c");

            await prisma.user.update({
                where: { id: author.id },
                data: { money: { [isWin ? "increment" : "decrement"]: isWin ? winAmount : amount } }
            });

            await registerLog({
                level: 6,
                message: t.log(isWin, winAmount, amount),
                tags: ["cassino", "transaction", "slots", isWin ? "sum" : "sub"],
                type: "info",
                user: author.id
            });

            await interaction.editReply({ embeds: [embed] });
        }, 2000);
    }, 2000);

    return;
}