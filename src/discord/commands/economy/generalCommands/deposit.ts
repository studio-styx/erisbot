import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { ChatInputCommandInteraction, userMention } from "discord.js";

export async function economyDepositCommand(interaction: ChatInputCommandInteraction<"cached">) {
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
    }

    if (value > userData.money.toNumber()) {
        value = userData.money.toNumber();
    }

    if (value <= 0) {
        interaction.editReply(res.danger(`${icon.Eris_cry} | Parece que você não tem dinheiro suficiente para realizar essa transação.`));
        return;
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            money: { decrement: value },
            bank: { increment: value },
        },
    });

    interaction.editReply(res.fuchsia(`${icon.Eris_ok} | Depósito de: **\`${value}\`** stx realizado com sucesso! agora você possui: **\`${user.bank}\`** em sua conta bancária`))
    
    await registerLog(
        `${icon.success} | ${userMention(id)} depositou: ${value} na conta bancária`,
        "info",
        1,
        id,
        "deposit"
    );
    return;
}