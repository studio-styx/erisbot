import { prisma } from "#database";
import { ButtonBuilder, ButtonStyle, Client } from "discord.js";
import { calculateDate } from "./utils/calculateDate.js";
import { res } from "./utils/embed.js";
import { icon } from "./utils/emojis.js";
import { createRow } from "@magicyan/discord";

export async function scheduleTransactionExpires(client: Client) {
    const transactions = await prisma.transaction.findMany({
        where: {
            status: "PENDING",
            expiresAt: { lt: calculateDate({ time: "10m", typeCalc: "increment" }) },
            OR: [
                { type: "USER" },
                { type: "API" }
            ]
        },
    });

    for (const transaction of transactions) {
        setTimeout(async () => {
            await setTransactionExpires(transaction.id, client);
        }, Math.max(1, transaction.expiresAt!.getTime() - Date.now()))
    }
}

export async function setTransactionExpires(id: number, client: Client) {
    const transaction = await prisma.transaction.findUnique({
        where: { id },
    });

    if (!transaction || transaction.status !== "PENDING") return;
    await prisma.transaction.update({
        where: { id },
        data: { status: "EXPIRED" },
    });

    if (!transaction.messageId || !transaction.guildId || !transaction.channelId) return;

    const guild = client.guilds.cache.get(transaction.guildId);
    if (!guild) return;

    let channel = guild.channels.cache.get(transaction.channelId) || null;
    if (!channel) {
        channel = await guild.channels.fetch(transaction.channelId);
    }
    if (!channel || !channel.isTextBased()) return;

    try {
        const message = await channel.messages.fetch(transaction.messageId);

        await message.edit(res.danger(`${icon.alarm} | O usuário demorou demais para aceitar a transação, por isso ela foi expirada!`, {
            components: [createRow(
                new ButtonBuilder({
                    customId: `transaction/expired/${transaction.id}`,
                    disabled: true,
                    label: "Transação expirada",
                    style: ButtonStyle.Danger,
                    emoji: icon.Eris_cry,
                })
            )]
        }));
    } catch (_) { }
}