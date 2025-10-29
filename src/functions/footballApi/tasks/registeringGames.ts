// registerGames.ts (adaptado para Sportmonks)
import { prisma } from "#database";
import { FootballSdk } from "#tools";

const sdk = new FootballSdk(); // Auto-carrega .env

export async function registerGames() {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);

    const matches = await sdk.sportmonks.fixtures.byDateRange(from, to);
    const games = matches.data;

    await prisma.$transaction(async (tx) => {
        for (const game of games) {
            const leagueId = BigInt(game.league_id);
            const homeTeamId = BigInt(game.home_team.id);
            const awayTeamId = BigInt(game.away_team.id);
            const fixtureId = BigInt(game.id);
            const venueApiId = game.venue_id?.toString();

            // === Liga ===
            await tx.footballLeague.upsert({
                where: { apiId: game.league_id.toString() },
                update: {},
                create: {
                    id: leagueId,
                    name: game.league.name,
                    country: game.league.country.name,
                    logo: game.league.symbol || "",
                    apiId: game.league_id.toString(),
                },
            });

            // === Times ===
            await Promise.all([
                tx.footballTeam.upsert({
                    where: { apiId: game.home_team.id.toString() },
                    update: {},
                    create: {
                        id: homeTeamId,
                        name: game.home_team.name,
                        logo: game.home_team.symbol || "",
                        apiId: game.home_team.id.toString(),
                        country: game.league.country.name,
                    },
                }),
                tx.footballTeam.upsert({
                    where: { apiId: game.away_team.id.toString() },
                    update: {},
                    create: {
                        id: awayTeamId,
                        name: game.away_team.name,
                        logo: game.away_team.symbol || "",
                        apiId: game.away_team.id.toString(),
                        country: game.league.country.name,
                    },
                }),
            ]);

            // === Estádio ===
            let venueConnect: { apiId: string } | undefined = undefined;
            if (venueApiId) {
                const existingStadium = await tx.footballTeamStadium.findUnique({
                    where: { apiId: venueApiId },
                });

                if (!existingStadium) {
                    // Busca detalhes via time da casa
                    const teamDetails = await sdk.sportmonks.teams.byId(Number(homeTeamId));
                    const venueData = teamDetails.data[0]?.venue || { name: game.home_team.venue?.name || "Desconhecido" };

                    await tx.footballTeamStadium.create({
                        data: {
                            name: venueData.name,
                            address: venueData.name || null,
                            capacity: 0,
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
                    status: game.status,
                    date: new Date(game.date),
                    venue: venueConnect ? { connect: venueConnect } : undefined,
                    goalsHome: game.goals.home,
                    goalsAway: game.goals.away,
                },
                create: {
                    id: fixtureId,
                    apiId: game.id.toString(),
                    leagueId: leagueId,
                    seasonId: BigInt(game.season_id),
                    homeTeamId: homeTeamId,
                    awayTeamId: awayTeamId,
                    date: new Date(game.date),
                    status: game.status,
                    goalsHome: game.goals.home,
                    goalsAway: game.goals.away,
                    statusShort: "desconhecido"
                },
            });

            if (venueConnect) {
                await tx.footballFixture.update({
                    where: { apiId: game.id.toString() },
                    data: { venue: { connect: venueConnect } },
                });
            }
        }
    });

    console.log(`Registrados: ${games.length} jogos`);
}