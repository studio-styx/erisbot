import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hora de TTL

export interface ServerSettings {
    chatBotChannels: string[];
    chatBotEnabled: boolean;
}

export function getServerSettings(guildId: string): ServerSettings | undefined {
    return cache.get<ServerSettings>(guildId);
}

export function setServerSettings(guildId: string, settings: ServerSettings): ServerSettings {
    cache.set(guildId, settings);
    return cache.get<ServerSettings>(guildId)!;
}