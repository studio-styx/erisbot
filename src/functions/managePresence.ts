import { prisma } from "#database";
import { settings } from "#settings";
import { ActivityOptions, ActivityType, Client } from "discord.js";
import { shuffleArray } from "./utils/shuffleArray.js";
import { formatNumber } from "./utils/formatNumber.js";
import { calculateProbability } from "./utils/getRandom.js";
import { limitText } from "@magicyan/discord";

type Presence = ActivityOptions & {
    time: number; // em segundos
}

export async function setNextPresence(client: Client<true>) {
    const getUser = async (id: string) => {
        return client.users.cache.get(id) ?? await client.users.fetch(id).catch(() => null)
    }

    const now = new Date();

    const dateFrom = new Date(now.setHours(0, 0, 0, 0));
    const dateTo = new Date(now.setHours(23, 59, 59, 999));

    const [todayBetterMatch, giveawaysCount, lastEndedGiveaway, petDied] = await prisma.$transaction([
        prisma.footballMatch.findFirst({
            where: {
                startAt: {
                    gte: dateFrom,
                    lte: dateTo
                }
            },
            orderBy: [
                {
                    goalsHome: "desc"
                },
                {
                    goalsAway: "desc"
                },
                {
                    bets: {
                        _count: "desc"
                    }
                },
                {
                    startAt: "asc"
                },
                {
                    homeTeam: {
                        points: "desc"
                    }
                },
                {
                    awayTeam: {
                        points: "desc"
                    }
                }
            ],
            include: {
                homeTeam: true,
                awayTeam: true
            }
        }),
        prisma.giveaway.count(),
        prisma.giveaway.findFirst({
            where: {
                expiresAt: {
                    lte: new Date(),
                    gte: dateFrom
                }
            },
            include: {
                participants: {
                    where: {
                        isWinner: true
                    },
                    select: {
                        user: {
                            select: {
                                id: true,
                                showNameInPresence: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                expiresAt: "desc"
            }
        }),
        prisma.userPet.findFirst({
            where: {
                isDead: true
            },
            include: {
                user: true
            }
        })
    ]);

    const userGiveawayWinner = lastEndedGiveaway?.participants.find(p => p.user.showNameInPresence);


    const giveawaysPresence: Presence[] = [
        {
            name: "Crie seu sorteio facilmente já! utilize /sorteios criar",
            time: 12
        },
        {
            name: "Conecte um sorteio com outro server facilmente!",
            time: 15
        },
        {
            name: `Já foram criados ${giveawaysCount} sorteios com meu sistema!`,
            time: 17
        },
    ]

    if (lastEndedGiveaway) {
        // Se o sorteio começa com "sorteio de" retirar esse "sorteio de"
        const giveawayName = limitText(
            lastEndedGiveaway.title.toLowerCase().startsWith("sorteio de") ?
                lastEndedGiveaway.title.slice(10)
                : lastEndedGiveaway.title
            , 20);
        if (userGiveawayWinner) {
            giveawaysPresence.push({
                name: `Parabéns ${limitText((await getUser(userGiveawayWinner.user.id))?.displayName ?? "desconhecido", 20)} por ganhar o sorteio: ${giveawayName}!`,
                time: 30
            })
        } else {
            giveawaysPresence.push({
                name: `Parabéns aos ganhadores do sorteio ${giveawayName}!`,
                time: 23
            })
        }
    }

    const footballBetPresences: Presence[] = [
        {
            name: "Sabia que agora dá pra apostar em jogos de futebol? use /futebol partida!",
            time: 27
        },
        {
            name: "Sabia que eu torço pro CSA?",
            time: 14
        },
        {
            name: todayBetterMatch ? `Assista já: ${todayBetterMatch.homeTeam.name} ${todayBetterMatch.goalsHome ?? ""} x ${todayBetterMatch.goalsAway ?? ""} ${todayBetterMatch.awayTeam.name}` : "Aposte em algum jogo!",
            time: todayBetterMatch ? 32 : 10
        }
    ]

    const cassinoPresences: Presence[] = [
        {
            name: "Use /cassino blackjack para jogar uma partida contra mim!",
            time: 20
        },
        {
            name: "Aposte usando os comandos /cassino",
            time: 15
        },
        {
            name: "É possivel jogar uma partida de blackjack contra seu amigo! use /cassino blackjack",
            time: 25
        }
    ]

    const petPresences: Presence[] = [
        {
            name: "Obtenha já seu pet usando /pet girar",
            time: 20
        },
        {
            name: "Cuide de seu pet! use /pet cuidar",
            time: 25
        },
        {
            name: "Você agora pode batalhar contra pets de outros usuários! use /pet batalhar",
            time: 30
        },
    ]

    petDied && petPresences.push({
        name: `Rip ${petDied.name} ${petDied.user.showNameInPresence ? `de: ${(await getUser(petDied.user.id))?.displayName ?? "desconhecido"}` : ""}`,
        time: 12
    });

    const erisCuriosity: Presence[] = [
        {
            name: "Sabia que originalmente era pra eu ter sido feita em kotlin?",
            time: 20
        },
        {
            name: "Eu torço pro CSA (CS Alagoano)",
            time: 15
        },
        {
            name: "Eu tinha uma gata chamada Lily, um dia ela atravessou a rua e foi atropelada :(",
            time: 25
        }
    ]

    const defaultPresences: Presence[] = [
        { name: `Estou em ${formatNumber(client.guilds.cache.size)} servidores!`, time: 35 },
        { name: `Vendo ${formatNumber(client.users.cache.size)} usuários!`, time: 30 },
        { name: `Minha versão: ${settings.bot.version}`, time: 21.5 }
    ];

    const presences: Presence[][] = [
        giveawaysPresence, footballBetPresences,
        petPresences, cassinoPresences, erisCuriosity
    ]

    const shuffledPresences = shuffleArray(presences);

    for (const presence of shuffledPresences) {
        const shufledDefaultPresences = shuffleArray(defaultPresences);
        if (calculateProbability(60)) {
            presence.push(...shufledDefaultPresences);
        }
        const shufledSubPresences = shuffleArray(presence);

        for (const currentPresence of shufledSubPresences) {
            client.user.setPresence({
                status: 'online',
                activities: [
                    {
                        name: currentPresence.name,
                        type: ActivityType.Custom,
                        state: currentPresence.name
                    }
                ]
            });
            await new Promise(resolve => setTimeout(resolve, currentPresence.time * 1000));
        }
    }

    setNextPresence(client);
}
