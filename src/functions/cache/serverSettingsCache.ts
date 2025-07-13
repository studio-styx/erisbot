import { prisma } from "#database";
import chalk from "chalk";
import { Client } from "discord.js";
import { defaultServerSettings } from "functions/defaultServerSettings.js";
import NodeCache from "node-cache";

const cache = new NodeCache(); // 1 hora de TTL

export interface ServerSettings {
    chatBotChannels: string[];
    chatBotEnabled: boolean;
    channelsCommandDisabled: string[];
    channelsCommandEnabled: string[];
    channelsCommandDisabledIsHabilited: boolean;
    channelsCommandEnabledIsHabilited: boolean;
}

export function getServerSettings(guildId: string): ServerSettings | undefined {
    return cache.get<ServerSettings>(guildId);
}

export function setServerSettings(guildId: string, settings: ServerSettings): ServerSettings {
    cache.set(guildId, settings);
    return cache.get<ServerSettings>(guildId)!;
}

export async function setAllServerSettings(client: Client): Promise<void> {
    const allPrismaServers = await prisma.guildSettings.findMany();
    const allDiscordServer = client.guilds.cache.values();

    for (const server of allDiscordServer) {
        const prismaServer = allPrismaServers.find(s => s.id === server.id);
        if (!prismaServer) {
            setServerSettings(server.id, defaultServerSettings)
            await prisma.guildSettings.create({
                data: {
                    id: server.id,
                    ...defaultServerSettings
                }
            })
            console.log(chalk.green(`- success to set default server settings from: ${server.name || "Unknown Server"}`));
            continue;
        }
        setServerSettings(server.id, prismaServer)
        console.log(chalk.green(`- success to set server settings from: ${server.name || "Unknown Server"}`));
    }
    console.log(chalk.green(`success to set all server settings!`));
}