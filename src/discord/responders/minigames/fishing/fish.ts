import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, res, resv2, setFishTimeout } from "#functions";
import { menus } from "#menus";
import { Rarity } from "#prisma";
import { ContainerComponent, TextDisplayComponent } from "discord.js";

createResponder({
    customId: "fishing/fish/:button/:userId/:date/:correct",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            button: Number(params.button),
            userId: params.userId,
            date: new Date(params.date),
            correct: params.correct === "true"
        }
    },
    async run(interaction, { date, userId, correct }) {
        const { user, message } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Eu sei que é legal pescar, mas essa pesca não é sua!`))
            return;
        }

        await interaction.deferUpdate();
        const messageContainer = message.components[0] as ContainerComponent
        const rodId = messageContainer.components[0].id!;
        const round = Number((messageContainer.components[0] as TextDisplayComponent).content.split("|")[1]);
        const correctButton = messageContainer.components.find(c => c.type === 1)
            ?.components.find(c => c.customId?.includes("/true"))
            ?.customId?.split("/")[2]
        await interaction.editReply(menus.minigames.fishing(userId, rodId, round, correctButton ? Number(correctButton) : undefined, true));

        if (!correct) {
            const fishingRod = await prisma.userFishingRod.update({
                where: {
                    id: rodId,
                    userId
                },
                data: {
                    durability: {
                        decrement: 1
                    }
                }
            });

            if (!fishingRod) {
                interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que sua vara de pesca sumiu derrepente enquanto pescava!`))
                return
            }

            if (fishingRod.durability < 1) {
                interaction.editReply(resv2.danger(`${icon.Eris_cry} | Sua vara de pesca quebrou após selecionar o local errado do lago!`))
                return;
            }

            await interaction.followUp(resv2.danger(`${icon.denied} | Você apertou em um botão errado ou antes da hora! sua vara de pesca diminuiu 1 ponto de durabilidade`))
            interaction.editReply(menus.minigames.fishing(userId, rodId))
            return;
        }

        function getFishRarity(reactionTime: number): Rarity {
            // ms para segundos
            const seconds = reactionTime / 1000;

            // quanto mais rápido, maior o boost em raridades altas
            let weights = {
                LEGENDARY: 4,
                EPIC: 10,
                RARE: 30,
                UNCOMUM: 40,
                COMUM: 60
            };

            if (seconds <= 0.3) { // clicou muito rápido
                weights.LEGENDARY += 10;
                weights.EPIC += 5;
                weights.COMUM -= 10;
            } else if (seconds <= 1) { // rápido
                weights.LEGENDARY += 5;
                weights.EPIC += 3;
                weights.COMUM -= 5;
            } else if (seconds > 3) { // lento
                weights.LEGENDARY -= 2;
                weights.EPIC -= 2;
                weights.COMUM += 5;
            }

            // normaliza pra somar 100
            const total = Object.values(weights).reduce((a, b) => a + b, 0);
            const rand = Math.random() * total;

            let acc = 0;
            for (const [rarity, weight] of Object.entries(weights)) {
                acc += weight;
                if (rand <= acc) return rarity as keyof typeof weights;
            }

            return "COMUM"; // fallback
        }

        const rarity = getFishRarity(date.getTime());

        const key = `fishing:fishs:${user.id}`;
        const avaibleFishs = await redis.get(key);
        let fishs: number = 20;
        if (avaibleFishs) {
            fishs = Number(avaibleFishs);
        } else {
            await redis.setex(key, 60 * 30, "20");
        }
        if (fishs < 1) {
            interaction.editReply(resv2.danger(`${icon.error} | Todos os peixes foram pescados! Espere um pouco para tentar novamente!`));
            return;
        }


        const [selectedFish, fishingRod] = await Promise.all([
            (async () => {
                const count = await prisma.fish.count({ where: { rarity } });
                const randomIndex = Math.floor(Math.random() * count);
                return prisma.fish.findFirst({
                    where: { rarity },
                    skip: randomIndex,
                    take: 1
                });
            })(),
            prisma.userFishingRod.findUnique({
                where: { id: rodId, userId },
                include: {
                    fishingRod: true
                }
            })
        ]);

        if (!selectedFish) {
            interaction.editReply(resv2.danger(`${icon.error} | Não foi possivel encontrar um peixe adequado! sinto muito por isso, isso foi erro meu! ${icon.Eris_cry}`))
            return;
        }
        if (!fishingRod) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Você perdeu sua vara de pesca em algum lugar desse lago!`))
            return;
        }
        if (fishingRod.durability < 1) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Sua vara de pesca quebrou antes de conseguir pescar aquele peixe! era um(a) **${selectedFish.name}**`))
            return;
        }

        const fishRarityOrder = {
            LEGENDARY: 2.3,
            EPIC: 1.7,
            RARE: 1.2,
            UNCOMUM: 0.9,
            COMUM: 0.7
        };

        const rodRarityOrder = {
            LEGENDARY: 2,
            EPIC: 1.6,
            RARE: 1,
            UNCOMUM: 0.5,
            COMUM: 0.3
        };

        // durabilidade original da vara (fishingRod.fishingRod.durability)
        const baseDurability = fishingRod.fishingRod.durability;

        // cálculo de desgaste
        const rawDecrement = (fishRarityOrder[selectedFish.rarity] / rodRarityOrder[fishingRod.fishingRod.rarity]) * (5 / baseDurability);

        const valueToDecrement = Math.max(1, Math.round(rawDecrement));

        const [_fish, newFishingRod] = await prisma.$transaction([
            prisma.userFish.create({
                data: {
                    fishId: selectedFish.id,
                    userId,
                }
            }),
            prisma.userFishingRod.update({
                where: {
                    id: rodId,
                    userId
                },
                data: {
                    durability: {
                        decrement: valueToDecrement
                    }
                }
            })
        ]);

        if (newFishingRod.durability < 1) {
            await prisma.userFishingRod.delete({
                where: {
                    id: rodId,
                    userId
                }
            })
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Sua vara de pesca quebrou após pescar o peixe: **${selectedFish.name}** (raridade: ${selectedFish.rarity})`));
            return;
        }
        await redis.setex(key, 60 * 30, fishs - 1)

        await interaction.editReply(menus.minigames.fishing(userId, rodId, round + 1));
        await interaction.followUp(res.success(`${icon.Eris_happy} | Você pescou o peixe: **${selectedFish.name}** (raridade: ${selectedFish.rarity}) que custa: **${selectedFish.price}**`))
        setFishTimeout(interaction, round + 1, Math.floor(Math.random() * 10000) + 1000);
        return;
    },
});