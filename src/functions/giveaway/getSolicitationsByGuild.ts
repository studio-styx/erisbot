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

export async function deleteKeysByGiveawayId(giveawayId: string): Promise<void> {
    const pattern = `connectedGiveaway:solicitation:*:${giveawayId}`;
    const stream = redis.scanStream({
        match: pattern,
        count: 100 // Ajuste o tamanho do lote conforme necessário
    });

    const pipeline = redis.pipeline(); // Cria um pipeline
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
            // Para cada lote de chaves encontrado, adiciona o comando DEL ao pipeline
            if (keys.length > 0) {
                keys.forEach(key => {
                    pipeline.del(key);
                    deletedCount++;
                });
                console.log(`Adicionado lote de ${keys.length} chaves ao pipeline.`);
            }
        });

        stream.on('end', async () => {
            console.log('Busca finalizada. Executando deleções...');
            // Executa todas as operações DEL em um único comando
            try {
                await pipeline.exec();
                console.log(`Deleção concluída. Total de ${deletedCount} chaves removidas.`);
                resolve();
            } catch (error) {
                reject(error);
            }
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}