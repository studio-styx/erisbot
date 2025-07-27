import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { ChatInputCommandInteraction, userMention } from "discord.js";

export async function economyWithdrawCommand(interaction: ChatInputCommandInteraction<"cached">) {
    let value = interaction.options.getNumber("amount")!;
    await interaction.deferReply({ flags: ["Ephemeral"] });

    const id = interaction.user.id;
    let userData = await prisma.user.findUnique({
        where: { id },
        select: { money: true, bank: true },
    });

    if (!userData) {
        userData = await prisma.user.create({
            data: { id },
            select: { money: true, bank: true }
        });
    };

    if (value > userData.bank.toNumber()) {
        value = userData.bank.toNumber();
    }

    if (value <= 0) {
        interaction.editReply(res.danger(`${icon.Eris_cry} | Parece que você não tem dinheiro suficiente para realizar essa transação.`));
        return;
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            money: { increment: value },
            bank: { decrement: value },
        },
    });

    interaction.editReply(res.pink(`${icon.Eris_ok} | Saque de: **\`${value}**\` stx realizado com sucesso! agora você possui: **\`${user.money}**\` em sua carteira!`))
    
    await registerLog(
        `${icon.success} | ${userMention(id)} sacou: ${value} da conta bancária`,
        "info",
        1,
        id,
        "deposit"
    );
    return;
}