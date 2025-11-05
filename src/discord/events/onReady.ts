import { createEvent } from "#base";
import {
    commandsManager, determineMoodInterval, registerFootballGames, scheduleAllEndGiveaways,
    scheduleReproductionsDate, scheduleTransactionExpires, setAllPetsStats, setAllServerSettings,
    setNextPresence,
    updateGames, verifyIfHasGames
} from "#functions";
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
        }, 1000 * 60 * 4)

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


        setNextPresence(client);
    }
});

