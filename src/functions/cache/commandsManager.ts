import { Command } from "#types/commands.js";
import fs from "node:fs/promises";

let cachedCommands: Command[] = [];

export const commandsManager = {
    fetch: () => cachedCommands,
    get: {
        id: (id: number) => cachedCommands.find(command => command.id === id),
        name: (name: string) => cachedCommands.find(command => command.name === name),
        category: (category: string) => cachedCommands.filter(command => command.category === category),
        isAvaible: (isAvaible: boolean) => cachedCommands.filter(command => command.isAvaible === isAvaible),
        highestId: () => {
            if (cachedCommands.length === 0) return 0;
            return Math.max(...cachedCommands.map(command => command.id || 0));
        }
    },
    add: (command: Command) => {
        cachedCommands.push(command);
    },
    addMany(commands: Command[]) {
        cachedCommands.push(...commands);
    },
    set: {
        id: (id: number, command: Command) => {
            const index = cachedCommands.findIndex(c => c.id === id);
            if (index === -1) return;
            cachedCommands[index] = command;
        },
        name: (name: string, command: Command) => {
            const index = cachedCommands.findIndex(c => c.name === name);
            if (index === -1) return;
            cachedCommands[index] = command;
        }
    },
    remove: {
        id: (id: number) => {
            cachedCommands = cachedCommands.filter(command => command.id !== id);
        },
        name: (name: string) => {
            cachedCommands = cachedCommands.filter(command => command.name !== name);
        }
    },
    removeAndUpdate: {
        id: async (id: number) => {
            commandsManager.remove.id(id);
            await fs.writeFile(`${__rootname}/commands.json`, JSON.stringify(cachedCommands, null, 2));
        },
        name: async (name: string) => {
            commandsManager.remove.name(name);
            await fs.writeFile(`${__rootname}/commands.json`, JSON.stringify(cachedCommands, null, 2));
        }
    },
    setAndUpdate: {
        id: async (id: number, command: Command) => {
            commandsManager.set.id(id, command);
            await fs.writeFile(`${__rootname}/commands.json`, JSON.stringify(cachedCommands, null, 2));
        },
        name: async (name: string, command: Command) => {
            commandsManager.set.name(name, command);
            await fs.writeFile(`${__rootname}/commands.json`, JSON.stringify(cachedCommands, null, 2));
        }
    },
    addAndUpdate: async (command: Command) => {
        commandsManager.add(command);
        await fs.writeFile(`${__rootname}/commands.json`, JSON.stringify(cachedCommands, null, 2));
    }
}