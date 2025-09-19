import { createEvent } from "#base";
import { prisma } from "#database";
import { icon, res, scheduleAllEndGiveaways, setAllServerSettings } from "#functions";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

const setExpiredTransactions = async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 1000);

    const expiredTransactions = await prisma.transaction.updateManyAndReturn({
        where: {
            status: "PENDING",
            createdAt: {
                lt: oneDayAgo
            },
            OR: [
                { type: "USER" },
                { type: "API" }
            ]
        },
        data: {
            status: "EXPIRED"
        }
    });

    console.log(`Transações marcadas como expiradas: ${expiredTransactions.length}`);
    return expiredTransactions;
}

createEvent({
    name: "ready",
    event: "ready",
    async run(client) {
        await setAllServerSettings(client);
        setInterval(async () => {
            const expiredTransactions = await setExpiredTransactions();
            for (const transaction of expiredTransactions) {
                if (!transaction.messageId || !transaction.guildId || !transaction.channelId) continue;

                const guild = client.guilds.cache.get(transaction.guildId);
                if (!guild) continue;

                let channel = guild.channels.cache.get(transaction.channelId) || null;
                if (!channel) {
                    channel = await guild.channels.fetch(transaction.channelId);
                }
                if (!channel || !channel.isTextBased()) continue;

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
                } catch (_) {}
            }
        }, 1000 * 60 * 60)
        scheduleAllEndGiveaways(client),
        setInterval(async () => {
            await scheduleAllEndGiveaways(client)
        }, 1000 * 60 * 10)
    }
});