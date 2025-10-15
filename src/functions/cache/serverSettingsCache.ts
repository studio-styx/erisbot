import { prisma } from "#database";
import { defaultServerSettings } from "#functions";
import chalk from "chalk";
import { Client } from "discord.js";
import NodeCache from "node-cache";

const cache = new NodeCache(); // 1 hora de TTL

export type RoleXpBonus = { bonus: number; id: string };
export type ChannelXpBonus = { bonus: number; id: string };
export type LevelGrant = { xp: number; grant: "channel" | "role"; id: string }
export type WarnLevelUp = { channel: string; enabled: boolean; message: Message; onlyIfWinSomeReward: boolean };
export type Message = { embed: Embed; content?: string | undefined; };
export type Embed = { title?: string | undefined; description?: string | undefined; color?: number | undefined; thumbnail?: string | undefined; footer?: Footer | undefined; image: string | undefined };
export type Footer = { text?: string | undefined; icon_url?: string | undefined; };

export interface ServerSettings {
    channelsCommandDisabled: string[];
    channelsCommandDisabledIsHabilited: boolean;
    channelsCommandEnabled: string[];
    channelsCommandEnabledIsHabilited: boolean;
    xpSystemEnabled: boolean;
    difficulty: number;
    rolesXpBonus: RoleXpBonus[];
    rolesNotWinXp: string[];
    channelsXpBonus: ChannelXpBonus[];
    channelsNotWinXp: string[];
    levelGrant: LevelGrant[];
    warnLevelUp: WarnLevelUp
};


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
                    ...defaultServerSettings,
                }
            })
            console.log(chalk.green(`- success to set default server settings from: ${server.name || "Unknown Server"}`));
            continue;
        }

        // Converter os dados do Prisma para o tipo ServerSettings
        const serverSettings: ServerSettings = {
            ...prismaServer,
            rolesXpBonus: prismaServer.rolesXpBonus ? JSON.parse(JSON.stringify(prismaServer.rolesXpBonus)) as RoleXpBonus[] : [],
            channelsXpBonus: prismaServer.channelsXpBonus ? JSON.parse(JSON.stringify(prismaServer.channelsXpBonus)) as ChannelXpBonus[] : [],
            levelGrant: prismaServer.levelGrant ? JSON.parse(JSON.stringify(prismaServer.levelGrant)) as LevelGrant[] : [],
            warnLevelUp: prismaServer.warnLevelUp ? JSON.parse(JSON.stringify(prismaServer.warnLevelUp)) as WarnLevelUp : {
                channel: "",
                enabled: false,
                message: {
                    embed: {
                        title: undefined,
                        description: undefined,
                        color: 0,
                        thumbnail: undefined,
                        footer: {
                            text: undefined,
                            icon_url: undefined
                        },
                        image: undefined
                    },
                    content: undefined
                },
                onlyIfWinSomeReward: false
            }
        };

        setServerSettings(server.id, serverSettings);
        console.log(chalk.green(`- success to set server settings from: ${server.name || "Unknown Server"}`));
    }
    console.log(chalk.green(`success to set all server settings!`));
}