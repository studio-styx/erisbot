import { createCommand } from "#base";
import { PrismaClient } from "#prisma/client";
import { res } from "#utils";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

// Inicializa o Prisma Client
const prisma = new PrismaClient();

// Estrutura de cache
interface CacheEntry {
    data: any;
    timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 40_000; // 40 segundos em milissegundos

// Função para obter as tabelas do esquema do Prisma
async function getTables(): Promise<string[]> {
    const tables = Object.keys(prisma).filter(
        (key) => !key.startsWith("_") && !key.startsWith("$")
    );
    return tables;
}

// Função para buscar dados de uma tabela específica
async function getTableData(table: string): Promise<any[]> {
    try {
        const data = await (prisma as any)[table].findMany();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar dados da tabela ${table}:`, error);
        return [];
    }
}

// Função para obter dados do cache ou do banco
async function getCachedData(key: string, fetchFn: () => Promise<any>): Promise<any> {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    const data = await fetchFn();
    cache.set(key, { data, timestamp: now });
    return data;
}

// Limpeza periódica do cache
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (now - entry.timestamp >= CACHE_DURATION) {
            cache.delete(key);
        }
    }
}, 60_000); // Executa a cada 60 segundos

createCommand({
    name: "sudo",
    description: "sudo commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "database",
            description: "manage database",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "query",
                    description: "query to use",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
        },
    ],
    async run(interaction) {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("You are not allowed to use this command!"));
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "database": {

            }
        }
    },
});