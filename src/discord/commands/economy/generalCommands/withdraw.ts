import { prisma } from "#database";
import { res, icon, registerLog } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyWithdrawCommand(interaction: ChatInputCommandInteraction<"cached">) {
    let value = interaction.options.getNumber("amount")!;
    await interaction.deferReply({ flags: ["Ephemeral"] });

    const id = interaction.user.id;
    const userData = await prisma.user.upsert({
        where: { id },
        create: { id },
        update: {},
        select: { money: true, bank: true },
    });

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

    interaction.editReply(res.fuchsia(`${icon.Eris_ok} | Saque de: **\`${value}\`** stx realizado com sucesso! agora você possui: **\`${user.money}\`** em sua carteira!`))
    
    await registerLog({
        level: 3,
        message: `Saque de ${value} stx da conta bancária`,
        tags: ["economy", "withdraw"],
        type: "info",
        user: id
    });
    return;
}