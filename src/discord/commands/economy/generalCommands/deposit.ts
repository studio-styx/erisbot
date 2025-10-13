import { prisma } from "#database";
import { res, registerLog } from "#functions";
import { getLang, translate } from "#locale";
import { ChatInputCommandInteraction } from "discord.js";

export async function economyDepositCommand(interaction: ChatInputCommandInteraction<"cached">) {
    let value = interaction.options.getNumber("amount")!;
    await interaction.deferReply({ flags: ["Ephemeral"] });

    const lang = getLang(interaction.locale);
    const t = translate.commands.bankManage[lang].deposit;

    const id = interaction.user.id;
    const userData = await prisma.user.upsert({
        where: { id },
        create: { id },
        update: {},
        select: { money: true, bank: true },
    });

    if (value > userData.money.toNumber()) {
        value = userData.money.toNumber();
    }

    if (value <= 0) {
        interaction.editReply(res.danger(t.notEnoughMoney));
        return;
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            money: { decrement: value },
            bank: { increment: value },
        },
    });

    interaction.editReply(res.fuchsia(t.message(value, user.bank.toNumber())))
    
    await registerLog({
        level: 3,
        message: t.log(value),
        tags: ["economy", "deposit"],
        type: "info",
        user: id
    });
    return;
}