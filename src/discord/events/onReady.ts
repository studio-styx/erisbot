import { createEvent } from "#base";
import { prisma } from "#database";
import { icon, res, scheduleAllEndGiveaways, setAllServerSettings } from "#functions";
import { settings } from "#settings";
import { createRow } from "@magicyan/discord";
import { ActivityType, ButtonBuilder, ButtonStyle } from "discord.js";

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
    event: "clientReady",
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
                } catch (_) { }
            }
        }, 1000 * 60 * 60)
        scheduleAllEndGiveaways(client),
            setInterval(async () => {
                await scheduleAllEndGiveaways(client)
            }, 1000 * 60 * 10);

        let currentIndex = 0;

        async function setNextPresence() {
            const presences = [
                {
                    name: `Em ${client.guilds.cache.size} servidores`,
                    type: ActivityType.Playing,
                    time: 32
                },
                {
                    name: `${client.users.cache.size} usuários`,
                    type: ActivityType.Watching,
                    time: 16,
                },
                {
                    name: `Versão ${settings.bot.version}`,
                    time: 34,
                    type: ActivityType.Listening
                },
                {
                    name: "Novo sistema de sorteios!",
                    time: 25,
                    type: ActivityType.Playing
                },
                {
                    name: "Jogue agora uma partida de termo! use /termo",
                    time: 30,
                },
                {
                    name: "Agora é possivel jogar blackjack contra seu amigo! use /cassino blackjack",
                    time: 50
                },
                {
                    name: "Comece a pescar! use /pescaria pescar",
                    time: 26
                },
                {
                    name: "Spoiler: versão 2.0.0 vai ter sistema de pets!",
                    time: 60
                },
                {
                    name: "Jogue uma partida de quiz! use /tryvia",
                    time: 15
                }
            ];

            // 1. Verifica se acabou a lista
            if (currentIndex >= presences.length) {
                // Define a atividade como indefinida e espera 12 segundos
                client.user.setActivity(undefined);
                await new Promise(resolve => setTimeout(resolve, 12000)); // Espera 12 segundos
                currentIndex = 0; // Reinicia o índice
                return setNextPresence(); // Chama a função novamente para recomeçar o ciclo
            }

            // 2. Define a atividade atual
            const currentPresence = presences[currentIndex];
            client.user.setActivity(currentPresence);

            // 3. Espera o tempo definido para a atividade atual (em milissegundos)
            await new Promise(resolve => setTimeout(resolve, currentPresence.time * 1000));

            // 4. Passa para a próxima atividade
            currentIndex++;
            setNextPresence();
        }
        setNextPresence();
    }
});

