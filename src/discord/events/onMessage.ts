import { createEvent, createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { onMention } from "./onMention.js";
import { xpSystem } from "./chat/xpSystem.js";
import { onAfkMentioned } from "./onAfkMentioned.js";
import { onResponseTryviaGame } from "./tryvia/response.js";
import { Gender, PersonalityTrait } from "#prisma";
import { getBrazilTime, icon, registerFootballGames, res, updateGames } from "#functions";
import { brBuilder, createSection, createSeparator, createTextDisplay } from "@magicyan/discord";
import { footballSdk } from "#tools";
import { ButtonBuilder, ButtonStyle, roleMention } from "discord.js";
import { menus } from "#menus";

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
                case "s.updategames": {
                    const msg = await message.reply(res.warning(`${icon.waiting_white} | Iniciando atualização das partidas....`));
                    try {
                        const result = await updateGames(message.client);
                        await msg.edit(res.success(brBuilder(
                            `## ${icon.success} | ${result?.matchesUpdated?.length || 0} Partidas atualizadas com sucesso!`,
                        )));
                    } catch (error) {
                        console.error(error);
                        await msg.edit(res.danger(`${icon.error} | Erro ao registrar partidas!`));
                    }
                    break;
                }
                case "s.viewgames": {
                    const response = await footballSdk.matches.getGamesByRange(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date());

                    const lastDayGames = response.matches;

                    const text = lastDayGames.map(game => `**${game.homeTeam.name}** ${game.score.fullTime.home} x ${game.score.fullTime.away} **${game.awayTeam.name}** status: **${game.status}**`).join("\n");

                    const maxLength = 2500;
                    for (let i = 0; i < text.length; i += maxLength) {
                        const chunk = text.slice(i, i + maxLength);
                        await message.channel.send(chunk);
                    }
                    break;
                }
                case "s.att18": {
                    await message.delete();

                    const components = [
                        createTextDisplay(`## ${icon.trophy} **Atualização 1.8.0 ╺╸ Sistema de Apostas em Futebol e Presenças Dinâmicas**`),
                        createSeparator(),
                        createSection(brBuilder(
                            `### :soccer: **Sistema de Apostas em Partidas Reais**`,
                            `A Éris agora permite apostar em jogos de futebol reais!`,
                            "Você pode arriscar parte do seu saldo tentando prever os resultados das partidas — acerte e ganhe, erre e perca.",
                            "As apostas usam dados oficiais e atualizam automaticamente assim que o jogo termina.",
                            "Tudo é feito com segurança e registrado no histórico de apostas.",
                        ), new ButtonBuilder({
                            style: ButtonStyle.Secondary,
                            label: "Abrir /football",
                            customId: "att/18/football"
                        })),
                        createSeparator(),
                        createSection(brBuilder(
                            "### :dizzy: **Presenças Dinâmicas e Personalizadas**",
                            "Os status da Éris foram totalmente reformulados!",
                            "Agora existem seções temáticas que mudam de acordo com eventos recentes — e você pode aparecer nelas.",
                            "Use o comando `/presença` para permitir que seu nome apareça nos status dinâmicos e fazer parte da exibição da Éris.",
                        ), new ButtonBuilder({
                            style: ButtonStyle.Secondary,
                            label: "Abrir /presença",
                            customId: "att/18/presence"
                        })),
                        createSeparator(),
                        createTextDisplay(brBuilder(
                            "### :arrows_counterclockwise: **Modo de Reinicialização**",
                            "Durante atualizações ou manutenções, a Éris exibirá automaticamente “Eu estou reiniciando...” ao tentar usar comandos — garantindo mais clareza e evitando respostas incorretas.",
                        )),
                        createSeparator(),
                        createTextDisplay(brBuilder(
                            `### ${icon.Eris_trusting} **Melhorias Internas**`,
                            "Pequenas otimizações e ajustes de estabilidade foram aplicados ao núcleo do bot."
                        )),
                        createTextDisplay(`-# ${roleMention("1397521296790650891")}`)
                    ];

                    await message.channel.send({
                        components,
                        flags: ["IsComponentsV2"]
                    })
                }

                default: {
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

createResponder({
    customId: "att/:att/:section",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { att, section }) {
        switch (att) {
            case "18": {
                switch (section) {
                    case "football": {
                        await interaction.deferReply({ flags });
                        const now = getBrazilTime();

                        const dateFrom = new Date(now);
                        dateFrom.setHours(0, 0, 0, 0);

                        const dateTo = new Date(now);
                        dateTo.setHours(23, 59, 59, 999);

                        const matches = await prisma.footballMatch.findMany({
                            where: {
                                startAt: {
                                    gte: dateFrom,
                                    lte: dateTo
                                }
                            },
                            include: {
                                homeTeam: true,
                                awayTeam: true,
                                competition: true
                            },
                            orderBy: [
                                { competition: { name: "asc" } },
                                { startAt: "asc" }
                            ]
                        });

                        await interaction.editReply(menus.football.matches.matchesMenu(matches, interaction.user.displayAvatarURL(), now))
                        return;
                    }
                    case "presence": {
                        await interaction.deferReply({ flags });

                        const user = await prisma.user.upsert({
                            where: {
                                id: interaction.user.id
                            },
                            create: {
                                id: interaction.user.id
                            },
                            update: {}
                        });

                        if (user.showNameInPresence) {
                            await prisma.user.update({
                                where: {
                                    id: interaction.user.id
                                },
                                data: {
                                    showNameInPresence: false
                                }
                            })

                            await interaction.editReply(res.success(
                                brBuilder(
                                    `## Nome na presença desabilitado!`,
                                )
                            ))
                        } else {
                            await prisma.user.update({
                                where: {
                                    id: interaction.user.id
                                },
                                data: {
                                    showNameInPresence: true
                                }
                            })

                            await interaction.editReply(res.success(
                                brBuilder(
                                    `## Nome na presença habilitado!`,
                                    `Agora, quando ocorrer algo interessante, seu nome pode aparecer em meu status!`
                                )
                            ))
                        }
                        return;
                    }
                }
            }
            default:
                await interaction.reply(res.danger(`${icon.error} | Botão não encontrado!`));
                break;
        }
    },
});