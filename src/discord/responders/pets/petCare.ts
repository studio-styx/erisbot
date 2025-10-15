import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { calculateProbability, convertTime, getRandomNumber, getRandomValue, getValidUserPet, icon, petPlays, petsFood, petSkillNameFormatted, res } from "#functions";
import { menus } from "#menus";
import { Prisma } from "#prisma";
import { randomNumber } from "@magicyan/discord";
import { time } from "discord.js";

createResponder({
    customId: "pet/care/:action/:responderType/:userId/:petId",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    parse(params) {
        return {
            action: params.action as "feed" | "play" | "sleep" | "train" | "return",
            userId: params.userId as string,
            petId: parseInt(params.petId)
        }
    },
    async run(interaction, { action, userId, petId }) {
        const { user } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando! não venha roubar pet dos outros!`));
            return;
        }
        await interaction.deferUpdate();
        const pet = await getValidUserPet(petId, user.id, {
            include: {
                personality: {
                    include: {
                        trait: true
                    }
                },
                pet: true,
                skills: {
                    include: {
                        skill: true
                    }
                }
            }
        });

        if (!pet) {
            interaction.reply(`${icon.error} | Eu não consegui encontrar esse pet!`);
            return;
        }

        switch (action) {
            case "feed": {
                if (interaction.isButton()) {
                    interaction.editReply(menus.pets.care(userId, pet, "feed"))
                } else {
                    const foodId = interaction.values[0];
                    const food = petsFood[pet.pet.animal].find(f => f.id === foodId);

                    if (!food) {
                        interaction.followUp(res.danger(`${icon.error} | Eu não consegui encontrar essa comida!`));
                        return;
                    }

                    if (pet.hungry === 100) {
                        interaction.followUp(res.danger(`${icon.denied} | Seu pet não está com fome!`))
                        return;
                    }

                    const newHungry = Math.min(pet.hungry + food.points, 100);

                    const userMoney = (await prisma.user.findUnique({
                        where: { id: user.id },
                        select: { money: true }
                    }) ?? { money: new Prisma.Decimal(0) }).money.toNumber();

                    if (userMoney < food.price) {
                        interaction.followUp(res.danger(`${icon.denied} | Você não tem dinheiro suficiente para comprar essa comida! você precisa de: **${food.price}** stx para esse alimento!`));
                        return;
                    }

                    // Aplica efeito temporário de humor
                    let moodEffect = "happy";
                    if (newHungry >= 95) {
                        moodEffect = "very full";
                    } else if (newHungry <= 30) {
                        moodEffect = "still hungry";
                    }

                    const newHappiness = Math.min(pet.happiness + getRandomNumber(1, 4), 100);
                    const newEnergy = Math.min(pet.energy + getRandomNumber(1, 4), 100);

                    const moodEffectKey = `pet:mood_effect:${pet.id}`;
                    await redis.setex(moodEffectKey, convertTime({ time: "30m", to: "seconds" }), moodEffect);

                    const [_user, newPet] = await prisma.$transaction([
                        prisma.user.update({
                            where: { id: user.id },
                            data: { money: { decrement: food.price } }
                        }),
                        prisma.userPet.update({
                            where: { id: pet.id },
                            data: {
                                hungry: newHungry,
                                happiness: newHappiness,
                                humor: moodEffect,
                                energy: newEnergy
                            },
                            include: {
                                personality: {
                                    include: {
                                        trait: true
                                    }
                                },
                                pet: true
                            }
                        })
                    ]);

                    interaction.followUp(res.success(`${icon.success} | Você alimentou seu pet! agora ele está **${moodEffect}** e sua fome está em: **${newHungry}/100**`))
                    interaction.editReply(menus.pets.care(userId, newPet, "feed"))
                }
                return;
            }
            case "play": {
                if (interaction.isButton()) {
                    interaction.editReply(menus.pets.care(userId, pet, "play"))
                } else {
                    const playId = interaction.values[0];
                    const play = petPlays[pet.pet.animal].find(p => p.id === playId);

                    if (!play) {
                        interaction.followUp(res.danger(`${icon.error} | Eu não consegui encontrar dados dessa brincadeira!`));
                        return;
                    }

                    if (pet.energy < play.energy) {
                        interaction.followUp(res.danger(`${icon.denied} | Seu pet não tem energia suficiente para brincar dessa brincadeira!`))
                        return;
                    }

                    const newFun = Math.min(pet.happiness + play.fun, 100);
                    const newEnergy = Math.max(pet.energy - play.energy, 0);

                    // Determina humor baseado no estado após brincar
                    let moodEffect = "playful";
                    if (newEnergy <= 20) {
                        moodEffect = "tired";
                    } else if (newFun >= 85) {
                        moodEffect = "very happy";
                    } else if (newEnergy <= 50 && newFun >= 70) {
                        moodEffect = "excited but tired";
                    }

                    const moodEffectKey = `pet:mood_effect:${pet.id}`;
                    await redis.setex(moodEffectKey, convertTime({ time: "60m", to: "seconds" }), moodEffect);

                    const newPet = await prisma.userPet.update({
                        where: { id: pet.id },
                        data: {
                            happiness: newFun,
                            energy: newEnergy,
                            humor: moodEffect
                        },
                        include: {
                            personality: {
                                include: {
                                    trait: true
                                }
                            },
                            pet: true
                        }
                    });

                    interaction.followUp(res.success(`${icon.success} | Você brincou com seu pet! agora ele está **${moodEffect}** e sua felicidade está em: **${newFun}/100**`));
                    if (newEnergy >= 100) {
                        interaction.editReply(menus.pets.care(userId, newPet))
                    } else {
                        interaction.editReply(menus.pets.care(userId, newPet, "play"))
                    }
                }
                return;
            }
            case "sleep": {
                if (!interaction.isButton()) return;
                if (pet.energy === 100) {
                    interaction.followUp(res.danger(`${icon.denied} | Seu pet já está com energia cheia!`))
                    return;
                }
                const newEnergy = Math.min(pet.energy + randomNumber(10, 30), 100);

                const newPet = await prisma.userPet.update({
                    where: { id: pet.id },
                    data: {
                        energy: newEnergy
                    },
                    include: {
                        personality: {
                            include: {
                                trait: true
                            }
                        },
                        pet: true
                    }
                });

                interaction.followUp(res.success(`${icon.success} | Você dormiu com seu pet! (lá ele) agora ele está com energia em: **${newEnergy}/100**`));
                interaction.editReply(menus.pets.care(userId, newPet));
                return;
            }
            case "train": {
                if (!interaction.isButton()) return;
                if (pet.energy <= 20 || pet.happiness <= 20 || pet.hungry <= 20) {
                    interaction.followUp(res.danger(`${icon.denied} | Seu pet não está em condições de treinar! Verifique se ele está descansado, feliz e bem alimentado.`));
                    return;
                }

                if (pet.skills.length >= 3) {
                    interaction.followUp(res.danger(`${icon.denied} | Seu pet já tem 3 habilidades!`));
                    return;
                }

                const cooldownKey = `pet:trainCooldown:${pet.id}`
                const onCooldown = await redis.get(cooldownKey);

                if (onCooldown) {
                    interaction.followUp(res.danger(`${icon.denied} | Seu pet está cansado! ele precisa descansar! volte novamente ${time(new Date(onCooldown), "R")}`))
                    return;
                }

                const xpKey = `pet:xp:${pet.id}`;
                const xp = Number((await redis.get(xpKey)) ?? 0);

                const chance = Math.min(xp / 25, 10);

                const wonASkill = pet.skills.length === 0
                    ? calculateProbability(chance + 25 + getRandomNumber(0, 10))
                    : pet.skills.length === 1
                        ? calculateProbability(chance + 15 + getRandomNumber(0, 10))
                        : calculateProbability(chance + 5 + getRandomNumber(0, 10));


                const newEnergy = Math.max(pet.energy - getRandomNumber(8, 20), 4);
                const newHappiness = Math.max(pet.happiness - getRandomNumber(3, 7), 4);
                const newHungry = Math.max(pet.hungry - getRandomNumber(6, 18), 4);
                const newXp = xp + getRandomNumber(5, 15);

                if (!wonASkill) {
                    const [newPet] = await Promise.all([
                        prisma.userPet.update({
                            where: { id: pet.id },
                            data: {
                                energy: newEnergy,
                                happiness: newHappiness,
                                hungry: newHungry
                            },
                            include: {
                                personality: {
                                    include: {
                                        trait: true
                                    }
                                },
                                pet: true,
                            }
                        }),
                        redis.setex(xpKey, convertTime({ time: "24h", to: "seconds" }), newXp.toString()),
                        redis.setex(
                            cooldownKey,
                            convertTime({ time: "15s", to: "seconds" }),
                            new Date(Date.now() + convertTime({ time: "15s", to: "milliseconds" })).toISOString()
                        ),
                    ])

                    const failMessages = [
                        "se distraiu com um inseto e não aprendeu nada novo.",
                        "ficou cansado demais para continuar.",
                        "não conseguiu se concentrar hoje.",
                        "tentou, mas acabou frustrado."
                    ];
                    const randomFail = getRandomValue(failMessages);
                    interaction.editReply(menus.pets.care(userId, newPet))
                    interaction.followUp(res.danger(`${icon.denied} | Você treinou com seu pet, mas ele ${randomFail}`));
                    return;
                }

                const petSkillsNames: string[] = pet.skills.map(s => s.skill.name);

                const allSkills = await prisma.petSkill.findMany({
                    where: {
                        name: { notIn: petSkillsNames }
                    },
                });

                if (allSkills.length === 0) {
                    interaction.followUp(res.warning(`${icon.info} | Seu pet já aprendeu todas as habilidades possíveis!`));
                    return;
                }


                const randomSkill = getRandomValue(allSkills);

                const [newPet] = await Promise.all([
                    prisma.userPet.update({
                        where: { id: pet.id },
                        data: {
                            energy: newEnergy,
                            happiness: newHappiness,
                            hungry: newHungry,
                            skills: {
                                create: {
                                    skillId: randomSkill.id
                                }
                            }
                        },
                        include: {
                            personality: {
                                include: {
                                    trait: true
                                }
                            },
                            pet: true,
                        }
                    }),
                    redis.del(xpKey),
                    redis.setex(
                        cooldownKey,
                        convertTime({ time: "15s", to: "seconds" }),
                        new Date(Date.now() + convertTime({ time: "15s", to: "milliseconds" })).toISOString()
                    ),
                ])

                interaction.editReply(menus.pets.care(userId, newPet))
                interaction.followUp(res.success(`${icon.Eris_happy} | Você treinou seu pet! ele adquiriu a habilidade: **${petSkillNameFormatted[randomSkill.name] || randomSkill.name}**!`));
                return;
            }
            case "return": {
                interaction.editReply(menus.pets.care(userId, pet))
                return;
            }
        }
    },
});