import { createEvent } from "#base";
import {
    commandsManager, determineMoodInterval, formatNumber, registerFootballGames, scheduleAllEndGiveaways,
    scheduleReproductionsDate, scheduleTransactionExpires, setAllPetsStats, setAllServerSettings,
    updateGames, verifyIfHasGames
} from "#functions";
import { settings } from "#settings";
import { Command } from "#types/commands.js";
import fs from "node:fs/promises"

createEvent({
    name: "ready",
    event: "clientReady",
    async run(client) {
        await setAllServerSettings(client);

        const raw = await fs.readFile(`${__rootname}/commands.json`, "utf-8");
        const commands = JSON.parse(raw) as Command[];

        commandsManager.addMany(commands);

        scheduleTransactionExpires(client);
        setInterval(async () => {
            await scheduleTransactionExpires(client);
        }, 1000 * 60 * 5);

        scheduleAllEndGiveaways(client);
        setInterval(async () => {
            await scheduleAllEndGiveaways(client)
        }, 1000 * 60 * 10);

        scheduleReproductionsDate(client);
        setInterval(async () => {
            await scheduleReproductionsDate(client);
        }, 1000 * 60 * 30)
        setInterval(async () => {
            await determineMoodInterval();
        }, 1000 * 60 * 30);
        setInterval(async () => {
            await setAllPetsStats(client);
        }, 1000 * 60 * 60 * 4)
        setInterval(async () => {
            const hasGames = await verifyIfHasGames();
            if (hasGames) {
                await updateGames(client);
            }
        }, 1000 * 60 * 10)

        function scheduleNextMonday() {
            const now = new Date();
            const nextMonday = new Date(now);

            // Ajusta para próxima segunda-feira
            nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
            nextMonday.setHours(2, 0, 0, 0);

            const delay = nextMonday.getTime() - now.getTime();

            setTimeout(() => {
                registerFootballGames(client);
                scheduleNextMonday(); // reagenda
            }, delay);
        }

        // Inicia
        scheduleNextMonday();

        let currentIndex = 0;

        async function setNextPresence() {
            const presences = [
                {
                    name: `Estou em ${client.guilds.cache.size} servidores`,
                    time: 32
                },
                {
                    name: `Estou vendo ${formatNumber(client.users.cache.size)} usuários`,
                    time: 16,
                },
                {
                    name: `Minha versão ${settings.bot.version}`,
                    time: 34,
                },
                {
                    name: "Crie já seu sorteio usando /sorteio criar!",
                    time: 25,
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
                    name: "Jogue uma partida de quiz! use /tryvia",
                    time: 15
                },
                {
                    name: "Novo sistema de pets! use o comando /pet",
                    time: 30
                },
                {
                    name: "Evento de halloween acontecendo! novos empregos e novos pets!",
                    time: 40
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

