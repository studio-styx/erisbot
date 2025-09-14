import { redis } from "#database";
import { Client } from "discord.js";

type MutualGuilds = { name: string; id: string }[]

export async function getMutualGuilds(client: Client, userId: string) {
    const key = `mutualGuilds:${userId}`;
    
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as MutualGuilds;

    const guilds = client.guilds.cache.values();

    const mutualGuilds: MutualGuilds = []
    for (const guild of guilds) {
        const member = await guild.members.fetch(userId);
        if (member) {
            mutualGuilds.push({
                name: guild.name,
                id: guild.id
            })
        }
    }

    await redis.setex(key, 60 * 10, JSON.stringify(mutualGuilds));
    return mutualGuilds;
}