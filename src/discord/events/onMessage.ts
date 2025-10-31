import { createEvent } from "#base";
import { prisma, redis } from "#database";
import { onMention } from "./onMention.js";
import { xpSystem } from "./chat/xpSystem.js";
import { onAfkMentioned } from "./onAfkMentioned.js";
import { onResponseTryviaGame } from "./tryvia/response.js";
import { FootballLeague, FootballMatch, FootballTeam, Gender, PersonalityTrait } from "#prisma";
import { icon, registerFootballGames, res } from "#functions";
import { brBuilder, randomNumber } from "@magicyan/discord";
import { MatchStatistics } from "#types/footballData/match.js";
import { createMatchImage } from "functions/footballApi/images/match.js";
import { AttachmentBuilder } from "discord.js";

createEvent({
    name: "onMessage",
    event: "messageCreate",
    async run(message) {
        if (message.author.id === "1171963692984844401") {
            const args = message.content.split(' ')
            const command = args.shift();

            if (!command) return;
            switch (command.toLowerCase()) {
                case "s.setpet": {
                    const code = JSON.parse(args.join(" ")) as {
                        userId: string;
                        petId: number;
                        name: string;
                        gender: Gender;
                        skills: { id: number; level: number }[];
                        personalityIds: number[] | "random";
                        geneticsIds: number[] | "random";
                    }

                    await message.delete().catch(() => null);

                    const getRandomPersonality = async () => {
                        const possibleTraits = await prisma.personalityTrait.findMany();

                        const shuffledTraits = [...possibleTraits].sort(() => Math.random() - 0.5);
                        const selectedTraits: PersonalityTrait[] = [];
                        let remainingSlots = Math.random() < 0.3 ? 2 : 1;

                        for (const trait of shuffledTraits) {
                            if (remainingSlots === 0) break;

                            // Verificar se a personalidade atual conflita com alguma já selecionada
                            const hasConflict = selectedTraits.some(selected =>
                                selected.personalityConflictNames.includes(trait.name) ||
                                trait.personalityConflictNames.includes(selected.name)
                            );

                            if (!hasConflict) {
                                selectedTraits.push(trait);
                                remainingSlots--;
                            }
                        }
                        const userPetPersonalities = selectedTraits.map(trait => ({
                            traitId: trait.id
                        }));

                        return userPetPersonalities;
                    }

                    const getRandomGenetics = async () => {
                        const geneticsCatalog = await prisma.genetics.findMany({ where: { petId: code.petId } });

                        const parts: { [key: string]: any[] } = {};
                        geneticsCatalog.forEach(gene => {
                            if (!parts[gene.colorPart]) parts[gene.colorPart] = [];
                            parts[gene.colorPart].push(gene);
                        });

                        // Selecionar um gene por colorPart com pesos baseados em geneType
                        const userPetGenetics: { geneId: number; inheritedFromParent1: boolean; inheritedFromParent2: boolean }[] = [];
                        for (const part in parts) {
                            const candidates = parts[part];
                            if (candidates.length === 0) continue;

                            // Definir pesos por geneType
                            const weights = candidates.map(gene => {
                                switch (gene.geneType) {
                                    case 'DOMINANT': return 50;
                                    case 'CODOMINANT': return 30;
                                    case 'NEUTRAL': return 15;
                                    case 'RECESSIVE': return 5;
                                    default: return 10;
                                }
                            });

                            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
                            const random = Math.random() * totalWeight;
                            let cumulative = 0;

                            for (let i = 0; i < candidates.length; i++) {
                                cumulative += weights[i];
                                if (random <= cumulative) {
                                    userPetGenetics.push({
                                        geneId: candidates[i].id,
                                        inheritedFromParent1: false, // Sem pais, geração inicial
                                        inheritedFromParent2: false
                                    });
                                    break;
                                }
                            }
                        }

                        return userPetGenetics;
                    }

                    try {
                        await prisma.userPet.create({
                            data: {
                                gender: code.gender,
                                name: code.name,
                                userId: code.userId,
                                petId: code.petId,
                                skills: {
                                    create: code.skills.map(s => ({ skillId: s.id, level: s.level }))
                                },
                                personality: {
                                    create: code.personalityIds === "random" ? await getRandomPersonality() : code.personalityIds.map(id => ({ traitId: id }))
                                },
                                genetics: {
                                    create: code.geneticsIds === "random" ? await getRandomGenetics() : code.geneticsIds.map(id => ({ geneId: id }))
                                }
                            }
                        });

                        const msg = await message.channel.send(res.success("Pet criado com sucesso!"));
                        setTimeout(() => msg.delete(), 5000);
                    } catch (error) {
                        console.error(error);
                        const msg = await message.channel.send(res.danger("Erro ao criar pet!"));
                        setTimeout(() => msg.delete(), 5000);
                    }
                    break;
                }
                case "s.redisset": {
                    const key = args.shift();
                    const time = args.shift();
                    const value = args.join(" ");

                    if (!key || !value || !time) {
                        message.reply(res.danger(`${icon.error} | The args: \`key\`, \`time\` and \`value\` are required!`))
                        return;
                    }

                    try {
                        if (time === "never" || time === "none" || time === "0" || time === "null" || time === "infinity") {
                            await redis.set(key, value);
                        } else {
                            await redis.setex(key, parseInt(time), value);
                        }
                        message.reply(res.success(`${icon.success} | Success to set the redis key: \`${key}\` the value: \`${value}\``))
                    } catch (error: any) {
                        message.reply(res.danger(`${icon.error} | Error to set the redis key: \`${key}\` the value: \`${value}\`: ${error.message || error}`));
                        console.error(error);
                    }
                    break;
                }
                case "s.fixturegames": {
                    const msg = await message.reply(res.warning(`${icon.waiting_white} | Iniciando registramento das partidas....`));
                    try {
                        const result = await registerFootballGames(message.client);
                        await msg.edit(res.success(brBuilder(
                            `## ${icon.success} | Partidas registradas com sucesso!`,
                            `Sucesso: ${result.success.length}`,
                            `Falhas: ${result.failed.length}`,
                            `Erros: ${result.errors.length}`,
                        )));
                    } catch (error) {
                        console.error(error);
                        await msg.edit(res.danger(`${icon.error} | Erro ao registrar partidas!`));
                    }
                    break;
                }
                case "s.image": {
                    type MatchType = (FootballMatch & {
                        homeTeam: FootballTeam & { statistics?: MatchStatistics },
                        awayTeam: FootballTeam & { statistics?: MatchStatistics },
                        competition: FootballLeague,
                        elapsed: string
                    });

                    function randomMatch(): MatchType {
                        return {
                            id: BigInt(123),
                            apiId: 987654,
                            venue: "Arena do Grêmio",
                            startAt: new Date(),
                            status: "FINISHED",
                            homeTeamId: BigInt(1),
                            awayTeamId: BigInt(2),
                            competitionId: BigInt(1),
                            goalsHome: 1,
                            goalsAway: 2,
                            oddsHomeWin: 2.3,
                            oddsDraw: 3.7,
                            oddsAwayWin: 2.5,
                            homeTeam: {
                                id: BigInt(1),
                                apiId: BigInt(176),
                                name: "Grêmio",
                                shortName: "Grêmio",
                                tla: "GRE",
                                crest: "https://crests.football-data.org/176.png",
                                address: "Porto Alegre",
                                clubColors: "Blue, Black & White",
                                venue: "Arena do Grêmio",
                                areaId: 2032,
                                points: 45,
                                statistics: {
                                    corner_kicks: 7,
                                    free_kicks: 12,
                                    goal_kicks: 5,
                                    offsides: 3,
                                    fouls: 8,
                                    ball_possession: 53,
                                    saves: 3,
                                    throw_ins: 22,
                                    shots: 12,
                                    shots_on_goal: 7,
                                    shots_off_goal: 5,
                                    yellow_cards: 2,
                                    yellow_red_cards: 0,
                                    red_cards: 0,
                                },
                            },
                            awayTeam: {
                                id: BigInt(2),
                                apiId: BigInt(177),
                                name: "Internacional",
                                shortName: "Inter",
                                tla: "INT",
                                crest: "https://crests.football-data.org/177.png",
                                address: "Porto Alegre",
                                clubColors: "Red & White",
                                venue: "Beira-Rio",
                                areaId: 2032,
                                points: 48,
                                statistics: {
                                    corner_kicks: 4,
                                    free_kicks: 11,
                                    goal_kicks: 6,
                                    offsides: 5,
                                    fouls: 5,
                                    ball_possession: 47,
                                    saves: 4,
                                    throw_ins: 20,
                                    shots: 11,
                                    shots_on_goal: 4,
                                    shots_off_goal: 7,
                                    yellow_cards: 3,
                                    yellow_red_cards: 0,
                                    red_cards: 0,
                                },
                            },
                            competition: {
                                id: BigInt(1),
                                apiId: BigInt(2013),
                                name: "Campeonato Brasileiro",
                                areaId: 2032,
                                code: "BSA",
                                type: "LEAGUE",
                                emblem: null,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                            elapsed: `${randomNumber(0, 90)}:${randomNumber(0, 59)}`
                        };
                    }

                    const matchDetails: MatchType = randomMatch(); // Dados aleatórios completos!

                    // Exemplo: gerar imagem
                    const imageBuffer = await createMatchImage(matchDetails);

                    const attachment = new AttachmentBuilder(imageBuffer, { name: `${matchDetails.homeTeam.name}-${matchDetails.awayTeam.name}.png` });
                    await message.reply({ files: [attachment] });
                    break;
                }
            }
        }
        onMention(message);
        xpSystem(message);
        onAfkMentioned(message);
        onResponseTryviaGame(message);
    }
});