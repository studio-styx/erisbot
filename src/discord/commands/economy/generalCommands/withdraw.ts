import { prisma } from "#database";
import { res, registerLog } from "#functions";
import { getLang, translate } from "#locale";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyWithdrawCommand(interaction: ChatInputCommandInteraction<"cached">) {
    let value = interaction.options.getNumber("amount")!;
    await interaction.deferReply({ flags: ["Ephemeral"] });

    const lang = getLang(interaction.locale);
    const t = translate.commands.bankManage[lang].withdraw;

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
        interaction.editReply(res.danger(t.notEnoughMoney));
        return;
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            money: { increment: value },
            bank: { decrement: value },
        },
    });

    interaction.editReply(res.fuchsia(t.message(value, user.money.toNumber())))
    
    await registerLog({
        level: 3,
        message: t.log(value),
        tags: ["economy", "withdraw"],
        type: "info",
        user: id
    });
    return;
}