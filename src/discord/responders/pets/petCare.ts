import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { convertTime, getRandomNumber, getValidUserPet, icon, petPlays, petsFood, res } from "#functions";
import { menus } from "#menus";
import { Prisma } from "#prisma";
import { randomNumber } from "@magicyan/discord";

createResponder({
    customId: "pet/care/:action/:responderType/:userId/:petId",
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    parse(params) {
        return {
            action: params.action as "feed" | "play" | "sleep" | "return",
            userId: params.userId as string,
            petId: parseInt(params.petId)
        }
    },
    async run(interaction, { action, userId, petId }) {
        const { user } = interaction;
        if (user.id !== userId) {
            interaction.reply(`${icon.denied} | Não foi você que executou esse comando! não venha roubar pet dos outros!`)
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
                pet: true
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
                        interaction.followUp(res.success(`${icon.denied} | Você não tem dinheiro suficiente para comprar essa comida! você precisa de: **${food.price}** stx para esse alimento!`));
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
                    interaction.editReply(menus.pets.care(userId, newPet))
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

                    interaction.followUp(res.success(`${icon.success} | Você brincou com seu pet! agora ele está **${moodEffect}** e sua felicidade está em: **${newFun}/100**`))
                    interaction.editReply(menus.pets.care(userId, newPet))
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
            case "return": {
                interaction.editReply(menus.pets.care(userId, pet))
                return;
            }
        }
    },
});