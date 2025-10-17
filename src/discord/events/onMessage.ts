import { createEvent } from "#base";
import { prisma } from "#database";
import { onMention } from "./onMention.js";
import { xpSystem } from "./chat/xpSystem.js";
import { onAfkMentioned } from "./onAfkMentioned.js";
import { onResponseTryviaGame } from "./tryvia/response.js";
import { Gender, PersonalityTrait } from "#prisma";
import { res } from "#functions";

createEvent({
    name: "onMessage",
    event: "messageCreate",
    async run(message) {
        if (message.author.id === "1171963692984844401") {
            const args = message.content.split(' ')
            const command = args.shift();

            if (!command) return;
            if (command.toLowerCase() === "s.setpet") {
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
            }
        }
        onMention(message);
        xpSystem(message);
        onAfkMentioned(message);
        onResponseTryviaGame(message);
    }
});