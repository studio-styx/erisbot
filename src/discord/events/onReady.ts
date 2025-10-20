import { createEvent } from "#base";
import { commandsManager, determineMoodInterval, scheduleAllEndGiveaways, 
    scheduleReproductionsDate, scheduleTransactionExpires, setAllPetsStats, setAllServerSettings 
} from "#functions";
import { settings } from "#settings";
import { Command } from "#types/commands.js";
import { ActivityType } from "discord.js";
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
                    name: "Jogue uma partida de quiz! use /tryvia",
                    time: 15
                },
                {
                    name: "Novo sistema de pets! use o comando /pet",
                    time: 30
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

