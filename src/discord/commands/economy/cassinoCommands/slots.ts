import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction } from "discord.js";

export async function slotsCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    let amount = options.getNumber("amount", true);
    await interaction.deferReply({ flags });

    const user = await prisma.user.findUnique({ where: { id: author.id } });

    if (!user || user.money.toNumber() < 25) {
        interaction.editReply(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para apostar.`));
        return;
    }

    if (user.money.toNumber() < amount) amount = user.money.toNumber();

    const slots = ["🍒", "🍊", "🍋", "🍉", "🍇", "🍓", "🍎", "🍐"];
    const jackpotChance = 0.15;
    const isForcedJackpot = Math.random() < jackpotChance;
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
        title: "🎰 Caça-Níqueis",
        description: `${slot1} | ${slot2} | - \n\nGirando...`,
        color: settings.colors.primary
    });

    await interaction.editReply({ embeds: [embed] });

    // Animação em 3 etapas
    setTimeout(async () => {
        embed.setDescription(`${slot1} | ${slot2} | - \n\nGirando...`);
        await interaction.editReply({ embeds: [embed] });

        setTimeout(async () => {
            const winAmount = amount * 0.6;

            embed.setDescription(isWin ? `${slot1} | ${slot2} | ${slot3}\n\n${icon.success} **JACKPOT!** Você ganhou **${winAmount}** STX!`
                : `${slot1} | ${slot2} | ${slot3}\n\nVocê perdeu **${amount}** STX.`
            );
            embed.setColor(isWin ? "#2ecc71" : "#e74c3c");

            await prisma.user.update({
                where: { id: author.id },
                data: { money: { [isWin ? "increment" : "decrement"]: isWin ? winAmount : amount } }
            });

            await registerLog(
                isWin ? `Ganhou ${winAmount} stx no cassino` : `Perdeu ${amount} stx no cassino`,
                "info",
                6,
                author.id,
                "cassino"
            );

            await interaction.editReply({ embeds: [embed] });
        }, 2000);
    }, 2000);

    return;
}