// #database/index.ts
import { PrismaClient } from "#prisma";
import { Redis } from "ioredis";

export const prisma = new PrismaClient();
export * from "./erisHelper.js";
export * from "./devzone.js";

// Usar rediss:// com usuário e senha
const redisUrl = process.env.REDIS_URL!;

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 100, // Mais tentativas
    retryStrategy: (times) => {
        const delay = Math.min(times * 500, 10000); // Delay crescente, máx 10s
        console.log(`Tentativa de reconexão ao Redis ${times}, delay: ${delay}ms`);
        return delay;
    },
    connectTimeout: 20000, // 20s para conexão inicial
    commandTimeout: 10000, // 10s para comandos
    enableOfflineQueue: true, // Fila comandos enquanto offline
    enableReadyCheck: true, // Verifica estado ready
    lazyConnect: true, // Conectar manualmente
    tls: {
        rejectUnauthorized: false, // Ignorar certificados autoassinados (teste)
        // Em produção, use rejectUnauthorized: true e forneça CA se necessário
    },
});

// Conectar ao Redis com retry
async function connectRedis() {
    let attempts = 0;
    const maxAttempts = 15; // Aumentar para 15 tentativas

    while (attempts < maxAttempts) {
        try {
            await redis.connect();
            console.log('Conexão inicial ao Redis bem-sucedida');
            const pingResponse = await redis.ping();
            console.log('Ping Redis:', pingResponse);
            return true;
        } catch (err) {
            attempts++;
            console.error(`Falha na tentativa ${attempts}/${maxAttempts} de conexão ao Redis:`, err);
            if (attempts === maxAttempts) {
                console.error('Número máximo de tentativas atingido.');
                return false;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
    return false;
}

// Chamar no startup
connectRedis().then((success) => {
    if (!success) {
        console.error('Não foi possível conectar ao Redis. Encerrando aplicação.');
        process.exit(1);
    }
});

export { connectRedis };