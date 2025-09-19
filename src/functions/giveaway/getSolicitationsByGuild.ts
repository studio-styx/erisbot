import { redis } from "#database";

export async function getSolicitationsByGuildScan(guildId: string) {
    const pattern = `connectedGiveaway:solicitation:${guildId}:*`;
    let cursor = '0';
    let keys: string[] = [];

    do {
        const [newCursor, foundKeys] = await redis.scan(cursor, 'MATCH', pattern);
        cursor = newCursor;
        keys = [...keys, ...foundKeys];
    } while (cursor !== '0');

    return Promise.all(
        keys.map(async (key) => {
            const [giveawayId, ttl] = await Promise.all([
                redis.get(key),
                redis.ttl(key)
            ]);

            return {
                key,
                giveawayId: giveawayId!,
                ttl
            };
        })
    );
}