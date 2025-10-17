import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { calculateProbability, convertTime, getRandomNumber, getRandomValue, icon, petAnimalFormatted, petRarityFormatted, petSkillNameFormatted, res, resv2 } from "#functions";
import { Gender, PersonalityTrait, Rarity } from "#prisma";
import { brBuilder, createRow, createSeparator } from "@magicyan/discord";
import { OmitPartialGroupDMChannel, Message, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, userMention, TextChannel } from "discord.js";

const rarityWeights: Record<Rarity, number> = {
    LEGENDARY: 2,
    EPIC: 12,
    RARE: 30,
    UNCOMUM: 40,
    COMUM: 60
};

const randomNames: Record<Gender, string[]> = {
    MALE: [
        "Rex", "Bolt", "Max", "Thor", "Simba", "Leo", "Rocky", "Spike", "Odin", "Zeus",
        "Milo", "Apollo", "Charlie", "Finn", "Hunter", "Shadow", "Toby", "Rusty", "Buster", "Ace",
        "Duke", "Sammy", "Tiger", "Jack", "Lucky", "Bear", "Scout", "King", "Gizmo", "Cosmo",
        "Ranger", "Blaze", "Samson", "Jasper", "Chico", "Bandit", "Oscar", "Hercules", "Finnick", "Arlo"
    ],
    FEMALE: [
        "Luna", "Bella", "Mia", "Nala", "Athena", "Daisy", "Cleo", "Ruby", "Sophie", "Chloe",
        "Lily", "Zoe", "Molly", "Rosie", "Willow", "Harper", "Stella", "Ivy", "Ella", "Jasmine",
        "Sadie", "Penny", "Lucy", "Maya", "Roxy", "Nina", "Aurora", "Ginger", "Hazel", "Olivia",
        "Fiona", "Flora", "Maisie", "Trixie", "Violet", "Mimi", "Coco", "Pepper", "Lacey", "Dottie"
    ]
};

function getRandomRarity(): Rarity {
    const weights = Object.entries(rarityWeights) as [Rarity, number][];
    const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
    const cumulativeWeights = weights.reduce((acc, [rarity, weight], i) => {
        acc.push([rarity, (acc[i - 1]?.[1] || 0) + weight]);
        return acc;
    }, [] as [Rarity, number][]);

    const random = Math.random() * totalWeight;
    for (const [rarity, cumulative] of cumulativeWeights) {
        if (random <= cumulative) return rarity;
    }
    return weights[weights.length - 1][0]; // Fallback
}

async function getRandomPet(rarity: Rarity) {
    const pets = await prisma.pet.findMany({
        where: { rarity },
        take: 1,
        orderBy: { id: 'asc' }, // Simula random com take 1
        skip: Math.floor(Math.random() * await prisma.pet.count({ where: { rarity } }))
    });
    return pets[0] || null;
}

async function createUserPet(
    userId: string,
    petId: number,
    gender: Gender,
    name: string
) {
    // Buscar catálogo de genes, skills e personalidades em uma transação
    const [geneticsCatalog, possibleSkills, possibleTraits] = await prisma.$transaction([
        prisma.genetics.findMany({ where: { petId } }),
        prisma.petSkill.findMany(),
        prisma.personalityTrait.findMany()
    ]);

    // Agrupar genes por colorPart
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

    // Chance de 40% de começar com uma skill
    const userPetSkills = Math.random() <= 0.4 && possibleSkills.length > 0
        ? [{ skillId: getRandomValue(possibleSkills).id, level: 1 }]
        : [];

    // Escolher 1–2 personalidades sem conflitos
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

    // Criar usuário e pet em uma transação
    const [_, userPet] = await prisma.$transaction([
        prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId }
        }),
        prisma.userPet.create({
            data: {
                userId,
                petId,
                gender,
                name,
                genetics: { create: userPetGenetics },
                skills: { create: userPetSkills },
                personality: { create: userPetPersonalities }
            },
            include: {
                genetics: { include: { gene: true } },
                skills: { include: { skill: true } },
                personality: { include: { trait: true } }
            }
        })
    ]);

    return userPet;
}

export async function aniversaryEvent(message: OmitPartialGroupDMChannel<Message<boolean>> | Message<boolean>, force: boolean = false) {
    // verificar se é um canal de texto
    if (!(message.channel instanceof TextChannel)) return;

    const author = message.author;
    // pegar o horário brasileiro
    const now = new Date();
    const brazilOffsetMs = -3 * 60 * 60 * 1000;
    const brazilNow = new Date(now.getTime() + brazilOffsetMs);

    // checar se é sábado dia 18 de outubro
    if (brazilNow.getDate() !== 17 || brazilNow.getMonth() !== 9) return;
    // checar se é o canal correto
    const channelId = "1428717675257004052";
    if (message.channelId !== channelId) return;

    // checar cooldow do usuário
    /*
    const cooldown = await redis.get(`aniversary:event:cooldown:${author.id}`);
    if (cooldown && !force) return;
    */

    // verificar se a mensagem tem haver com aniversário
    const aniversaryMessages = [
        "aniversário",
        "aniversary",
        "birthday",
        "aniversario",
        "niver"
    ];

    const messageLower = message.content.toLowerCase();

    // Verifica se a mensagem contém alguma das palavras
    const hasAniversaryWord = aniversaryMessages.some(word =>
        messageLower.includes(word)
    );

    if (!hasAniversaryWord && !force) return;

    const stxReward = async () => {
        const randomStx = getRandomNumber(70, 200);

        const user = await prisma.user.upsert({
            where: { id: author.id },
            select: { money: true },
            create: { id: author.id, money: randomStx },
            update: { money: { increment: randomStx } }
        });

        return {
            reward: randomStx,
            newBalance: user.money.toNumber()
        }
    }

    const rarity = getRandomRarity();
    const pet = await getRandomPet(rarity);
    const petReward = async () => {

        if (!pet) {
            return null;
        }

        // Gerar dados do pet
        const petGender = calculateProbability(50) ? "MALE" : "FEMALE" as Gender;
        const petName = getRandomValue(randomNames[petGender]);

        const userPet = await createUserPet(author.id, pet.id, petGender, petName);

        return userPet;
    }

    const activePetBuff = async () => {
        const user = await prisma.user.upsert({
            where: { id: author.id },
            select: { activePet: { where: { isDead: false, adoption: null }, include: { skills: true } }, pets: { where: { isDead: false, adoption: null }, include: { skills: true } } },
            create: { id: author.id },
            update: {}
        });

        let activePet = user.activePet;

        if (!activePet) {
            // se não tiver pet então o pet mais próximo será recompensado
            activePet = user.pets[0];
            // se ainda assim não existir pets, redirecionar para ganhar algum pet
            if (!activePet) return null;
        }

        const hasASkill = activePet.skills.length > 0;

        const chance = getRandomNumber(0, 100);

        const buff = (chance > 60)
            ? "100AllAttributes"
            : (chance > 30 && !hasASkill)
                ? "getASkill"
                : (chance > 30 && hasASkill)
                    ? "buffASkill"
                    : "reviveAPet";

        switch (buff) {
            case "buffASkill": {
                const skill = getRandomValue(activePet.skills);

                const petSkill = await prisma.userPetSkill.update({
                    where: { id: skill.id },
                    data: { level: { increment: 1 } },
                    include: { skill: true }
                });

                return {
                    type: buff,
                    skill: petSkill,
                    pet: activePet
                };
            }
            case "getASkill": {
                const skill = getRandomValue(await prisma.petSkill.findMany({ where: { id: { notIn: activePet.skills.map(s => s.id) } } }));

                if (!skill) return activePetBuff();

                const petSkill = await prisma.userPetSkill.create({
                    data: {
                        userPetId: activePet.id,
                        skillId: skill.id,
                        level: 1
                    },
                    include: { skill: true }
                });

                return {
                    type: buff,
                    skill: petSkill,
                    pet: activePet
                };
            }
            case "100AllAttributes": {
                await prisma.userPet.update({
                    where: { id: activePet.id },
                    data: {
                        happiness: 100,
                        energy: 100,
                        hungry: 100
                    }
                });

                return {
                    type: buff,
                    pet: activePet
                };
            }
            case "reviveAPet": {
                const diedPets = await prisma.userPet.findMany({
                    where: {
                        userId: author.id,
                        isDead: true,
                        adoption: null
                    }
                });

                if (diedPets.length === 0) return activePetBuff();

                return {
                    type: buff,
                    pets: diedPets
                }
            }
        }
    }

    const chance = getRandomNumber(0, 100);

    const petRewardFunction = async () => {
        const userPet = await petReward();

        if (!userPet) {
            const { reward, newBalance } = await stxReward();

            await message.reply(res.fuchsia(`${icon.Eris_happy} | Você desejou parabéns para meu criador! você ganhou: **${reward}** e agora tem: **${newBalance}** na carteira!`))
            return;
        }

        await message.reply(resv2.success(
            `## Recompensa`,
            createSeparator(),
            `Você desejou feliz aniversário para meu criador, e ganhou um pet **${petRarityFormatted[pet.rarity].toLowerCase()}**!`,
            brBuilder(
                "### Detalhes do Pet",
                `**Nome:** ${userPet.name}`,
                `**Animal:** ${petAnimalFormatted[pet.animal]} (Espécie: **${pet.specie}**)`,
                `**Raridade:** ${petRarityFormatted[pet.rarity]}`,
                `**Gênero:** ${userPet.gender === "MALE" ? "Macho" : "Fêmea"}`,
                `**Personalidades:** ${userPet.personality.length > 0 ? userPet.personality.map(p => p.trait.name).join(", ") : "Nenhuma"}`,
                `**Humor:** ${userPet.humor}`,
                `**Habilidades:** ${userPet.skills.length > 0 ? userPet.skills.map(skill => `**\`${petSkillNameFormatted[skill.skill.name] || skill.skill.name}\`** - Nível **${skill.level}**`).join(", ") : "Nenhuma"}`,
                `**Genética:** \n ${userPet.genetics.length > 0 ? userPet.genetics.map(g => `**\`${g.gene.trait}\` - \`(${g.gene.colorPart})\`** [**${g.gene.geneType}**]`).join("\n") : "Nenhuma"}`,
                `**Pais:** ${userPet.parent1Id || userPet.parent2Id ? "Tem pais" : "Nenhum (geração inicial)"}`,
                `**Está grávida?:** ${userPet.isPregnant ? "Sim" : "Não"}`
            ),
            createSeparator(),
            brBuilder(
                `Você pode renomear seu pet ou colocá-lo para adoção.`
            ),
            createRow(
                new ButtonBuilder({
                    customId: `pet/spin/name/${author.id}/${userPet.id}`,
                    label: "Trocar Nome",
                    style: ButtonStyle.Primary
                }),
                new ButtonBuilder({
                    customId: `pet/spin/del/${author.id}/${userPet.id}`,
                    label: "Desfazer Pet",
                    style: ButtonStyle.Danger
                })
            )
        ));
    }

    await message.channel.sendTyping();

    if (chance > 60) {
        const { reward, newBalance } = await stxReward();

        await message.reply(res.fuchsia(`${icon.Eris_happy} | Você desejou parabéns para meu criador! você ganhou: **${reward}** e agora tem: **${newBalance}** na carteira!`))
    } else if (chance > 25) {
        await petRewardFunction();
    } else {
        const result = await activePetBuff();

        if (!result) {
            await petRewardFunction();
            return;
        }

        const { type } = result;

        switch (type) {
            case "buffASkill": {
                const { skill, pet } = result;
                await message.reply(res.fuchsia(`${icon.Eris_enchanted} | Obrigada! Você desejou parabéns ao meu criador, e seu pet **${pet!.name}** subiu 1 level da habilidade **${petSkillNameFormatted[skill!.skill.name] || skill!.skill.name}** agora ela tá level: **${skill!.level}**!`));
                break;
            }
            case "getASkill": {
                const { skill, pet } = result;
                await message.reply(res.fuchsia(`${icon.Eris_enchanted} | Você desejou parabéns ao meu criador! por isso, ganhou uma recompensa! Seu pet **${pet!.name}** ganhou a habilidade **${petSkillNameFormatted[skill!.skill.name] || skill!.skill.name}**!`));
                break;
            }
            case "100AllAttributes": {
                const { pet } = result;
                await message.reply(res.fuchsia(`${icon.Eris_happy} | Muito obrigada por ter desejado feliz aniversário ao meu criador! por isso, seu pet: **${pet!.name}** teve todas as suas estatisticas aumentadas para **100**!`))
                break;
            }
            case "reviveAPet": {
                const { pets } = result;

                if (pets!.length === 1) {
                    const pet = await prisma.userPet.update({
                        where: { id: pets![0].id },
                        data: {
                            isDead: false,
                            hungry: 100,
                            energy: 100,
                            happiness: 100
                        },
                    });

                    await message.reply(res.fuchsia(`${icon.Eris_enchanted} | Você desejou feliz aniversário para meu criador! Por isso, seu pet **${pet!.name}** voltou a vida!`))
                    break;
                }

                await message.reply(resv2.fuchsia(
                    `## Você desejou feliz aniversário para meu criador!`,
                    createSeparator(),
                    brBuilder(
                        `Por isso, você ganhou o direito de poder reviver **1** de seus pets mortos! não é todo dia que se ganha um beneficio assim!`,
                        `Você pode escolher um dos pets abaixo para revivê-lo!`
                    ),
                    new StringSelectMenuBuilder({
                        customId: `event/aniversary/revivePet/${author.id}`,
                        options: pets!.map(pet => ({
                            label: pet.name,
                            value: pet.id.toString()
                        })),
                        placeholder: "Escolha um pet para reviver"
                    })
                ))
                break;
            }
        }
    }

    // setar o cooldown
    await redis.setex(`aniversary:event:cooldown:${author.id}`, convertTime({ time: "1h", to: "seconds" }), "true");
}

createResponder({
    customId: "event/aniversary/revivePet/:userId",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction, { userId }) {
        const { user, values } = interaction;

        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.Eris_Angry} | Ei! isso é um momento especial com ${userMention(userId)}, ele deve escolher um pet para reviver, não venha querer estragar isso!`));
            return;
        }

        const petId = +values[0];

        await interaction.deferUpdate();

        const pet = await prisma.userPet.findUnique({
            where: { id: petId, userId }
        });

        const getUserPets = async () => await prisma.userPet.findMany({ where: { userId, isDead: true, adoption: null } });

        if (!pet) {
            const pets = await getUserPets();

            if (pets.length === 0) {
                interaction.editReply(`${icon.denied} | Você não tem nenhum pet morto para reviver!`)
                return;
            }
            interaction.editReply(resv2.danger(
                `${icon.Eris_embarrassed} | Opsie, ocorreu um erro! o pet desejado não foi encontrado! por favor escolha novamente`,
                new StringSelectMenuBuilder({
                    customId: `event/aniversary/revivePet/${userId}`,
                    options: pets!.map(pet => ({
                        label: pet.name,
                        value: pet.id.toString()
                    })),
                    placeholder: "Escolha um pet para reviver"
                })
            ))
            return
        }
        if (!pet.isDead) {
            const pets = await getUserPets();

            if (pets.length === 0) {
                interaction.editReply(`${icon.denied} | Você não tem nenhum pet morto para reviver!`)
                return;
            }
            interaction.editReply(resv2.danger(
                `${icon.Eris_embarrassed} | Opsie, ocorreu um erro! o pet desejado está vivo! tente novamente`,
                new StringSelectMenuBuilder({
                    customId: `event/aniversary/revivePet/${userId}`,
                    options: pets!.map(pet => ({
                        label: pet.name,
                        value: pet.id.toString()
                    })),
                    placeholder: "Escolha um pet para reviver"
                })
            ))
            return
        }

        const updatedPet = await prisma.userPet.update({
            where: { id: petId },
            data: {
                isDead: false,
                hungry: 100,
                energy: 100,
                happiness: 100
            },        
        });

        interaction.editReply(resv2.success(`${icon.Eris_happy} | Seu pet **${updatedPet.name}** voltou a vida! ele está com todos os seus atributos no máximo!`))
    },
});