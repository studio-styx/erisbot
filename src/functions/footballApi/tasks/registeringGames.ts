import { prisma } from "#database";
import { Prisma, PrismaClient } from "#prisma";
import { FootballSdk } from "#tools";
import { Fixture } from "#types/sportMonks/fixtures.js";
import { DefaultArgs } from "../../../../prisma/eris/runtime/library.js";

const sdk = new FootballSdk();

export async function registerGames() {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);

    const matches = await sdk.sportmonks.fixtures.byDateRange(from, to);
    const games = matches.data;

    console.log(`Total de jogos: ${games.length}`);

    // === Dividir em blocos de 10 ===
    const chunkSize = 10;
    const chunks: Fixture[][] = []; // array dimencional de jogos (array de arrays de jogos)
    for (let i = 0; i < games.length; i += chunkSize) {
        chunks.push(games.slice(i, i + chunkSize));
    }

    // === Processar em paralelo (máx 3 transações simultâneas) ===
    const concurrency = 3;
    const results = await Promise.allSettled(
        chunks.map((chunk, index) =>
            prisma.$transaction(
                async (tx) => {
                    console.log(`[Bloco ${index + 1}/${chunks.length}] Processando ${chunk.length} jogos`);
                    for (const game of chunk) {
                        await processGame(tx, game);
                    }
                },
                {
                    maxWait: 30_000,  // 30 segundos
                    timeout: 60_000,  // 60 segundos (recomendado para upsert pesado)
                }
            ).catch((err) => {
                console.error(`[Bloco ${index + 1}] Falhou:`, err);
                throw err; // Rejeita para Promise.allSettled capturar
            })
        ).slice(0, concurrency) // Limita concorrência
    );

    const failed = results.filter(r => r.status === "rejected");
    if (failed.length > 0) {
        console.warn(`${failed.length} blocos falharam.`);
    }

    console.log(`Registrados com sucesso: ${games.length} jogos`);

    return {
        totalGames: games.length,
        success: games.length - failed.length,
        failed: failed.length,
        chunks: chunks.length
    }
}

// === Função isolada para processar 1 jogo ===
async function processGame(tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">, game: Fixture) {
    const leagueId = BigInt(game.league_id);
    const fixtureId = BigInt(game.id);

    const league = game.league;
    if (!league) return;

    // === Liga ===
    await tx.footballLeague.upsert({
        where: { apiId: game.league_id.toString() },
        update: {},
        create: {
            id: leagueId,
            name: league.name,
            country: league.country?.name || "Desconhecido",
            logo: league.image_path,
            apiId: game.league_id.toString(),
        },
    });

    // === Times ===
    const home = game.participants?.find(p => p.meta?.location === "home");
    const away = game.participants?.find(p => p.meta?.location === "away");
    if (!home || !away) return;

    const homeTeamId = BigInt(home.id);
    const awayTeamId = BigInt(away.id);

    await Promise.all([
        tx.footballTeam.upsert({
            where: { apiId: home.id.toString() },
            update: {},
            create: {
                id: homeTeamId,
                name: home.name,
                logo: home.image_path,
                apiId: home.id.toString(),
                country: league.country?.name || "Desconhecido",
            },
        }),
        tx.footballTeam.upsert({
            where: { apiId: away.id.toString() },
            update: {},
            create: {
                id: awayTeamId,
                name: away.name,
                logo: away.image_path,
                apiId: away.id.toString(),
                country: league.country?.name || "Desconhecido",
            },
        }),
    ]);

    // === Estádio ===
    let venueConnect: { apiId: string } | undefined = undefined;
    const venueApiId = game.venue_id?.toString();

    if (venueApiId && game.venue) {
        const exists = await tx.footballTeamStadium.findUnique({
            where: { apiId: venueApiId },
        });

        if (!exists) {
            await tx.footballTeamStadium.create({
                data: {
                    name: game.venue.name,
                    address: game.venue.address || null,
                    capacity: game.venue.capacity || null,
                    apiId: venueApiId,
                },
            });
        }
        venueConnect = { apiId: venueApiId };
    }

    // === Fixture ===
    await tx.footballFixture.upsert({
        where: { apiId: game.id.toString() },
        update: {
            status: game.result_info || "Não iniciado",
            date: new Date(game.starting_at),
            venue: venueConnect ? { connect: venueConnect } : undefined,
        },
        create: {
            id: fixtureId,
            apiId: game.id.toString(),
            leagueId,
            homeTeamId,
            awayTeamId,
            date: new Date(game.starting_at),
            status: game.result_info || "Não iniciado",
            statusShort: "NS",
        },
    });
}