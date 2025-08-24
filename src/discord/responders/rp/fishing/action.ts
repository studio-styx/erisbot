import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { res, icon, FishPosition, resv2 } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { Items } from "#types/items.js";
import { createContainer } from "@magicyan/discord";

createResponder({
    customId: "fishing/action/:action/:x/:y/:userId",
    parse(params) {
        return {
            x: parseInt(params.x),
            y: parseInt(params.y),
            userId: params.userId,
            action: params.action as "catch" | "cancel" | "end"
        }
    },
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { x, y, userId, action }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não é você que está percando!`))
            return;
        }

        await interaction.deferUpdate();
        const raw = await redis.get(`fishing:session:${interaction.user.id}`);
        if (!raw) {
            if (action === "cancel" || action === "end") {
                interaction.editReply(resv2.success(`${icon.success} | Sua sessão de pesca já havia expirado!`));
                return;
            }
            interaction.editReply(resv2.danger(`${icon.denied} | Sua sessão de pesca expirou! Inicie uma nova pescaria.`));
            return;
        }

        switch (action) {
            case "catch": {
                const fishs = JSON.parse(raw) as FishPosition[];
                const fish = fishs.find(fish => fish.x === x && fish.y === y);

                if (!fish) {
                    interaction.followUp(res.danger(`${icon.denied} | Não há um peixe nessa posição!`));
                    return;
                }

                // VERIFICAR A VARA ANTES DE TENTAR PESCAR
                const getUserFishingRod = async () => {
                    const fishingRodRedis = await redis.get(`inventory:${interaction.user.id}:fishing_rod`);
                    type FishingRod = {
                        userId: string;
                        createdAt: Date;
                        itemId: number;
                        amount: number;
                        expiresAt: Date | null;
                        durability: number | null;
                    }
                    if (fishingRodRedis) {
                        return JSON.parse(fishingRodRedis) as FishingRod;
                    } else {
                        const fishingRodDb = await prisma.inventory.findUnique({
                            where: {
                                userId_itemId: {
                                    userId: interaction.user.id,
                                    itemId: Items.fishing_rod
                                }
                            }
                        });
                        if (!fishingRodDb) {
                            return null;
                        }
                        return fishingRodDb;
                    }
                }

                const fishingRod = await getUserFishingRod();

                // Verificar se a vara existe
                if (!fishingRod) {
                    interaction.followUp(res.danger(`${icon.denied} | Você não tem uma vara de pescar!`));
                    return;
                }

                // Verificar se a vara expirou
                if (fishingRod.expiresAt && fishingRod.expiresAt < new Date()) {
                    interaction.followUp(res.danger(`${icon.denied} | Sua vara de pescar expirou!`));
                    return;
                }

                // Verificar se a vara está quebrada (durabilidade <= 0)
                if (fishingRod.durability !== null && fishingRod.durability <= 0) {
                    const components = [
                        createContainer({
                            accentColor: settings.colors.danger,
                            components: [
                                `${icon.denied} | Sua vara de pescar está quebrada! Não é possível pescar.`
                            ],
                        })
                    ];
                    interaction.editReply({ components, flags: ["IsComponentsV2"] });
                    return;
                }

                // REDUZIR A DURABILIDADE ANTES DE PESCAR
                if (fishingRod.durability !== null) {
                    fishingRod.durability -= 1;
                }

                // VERIFICAR SE QUEBROU APÓS REDUZIR A DURABILIDADE
                if (fishingRod.durability !== null && fishingRod.durability <= 0) {
                    // VARA QUEBROU - FINALIZAR PESCARIA
                    fish.caught = true; // Marcar o peixe como pego antes de finalizar

                    await redis.del(`fishing:session:${interaction.user.id}`);

                    // Calcular peixes pegos
                    const caughtCount = fishs.filter(fish => fish.caught).length;

                    // Atualizar quantidade total de peixes
                    const totalFishRaw = await redis.get(`fishing:fish:quantity`);
                    const totalFish = totalFishRaw ? parseInt(totalFishRaw) : 20;
                    const newTotalFish = Math.max(0, totalFish - caughtCount);
                    await redis.setex(`fishing:fish:quantity`, 3600, newTotalFish.toString());

                    // Remover vara do inventário
                    await prisma.inventory.delete({
                        where: {
                            userId_itemId: {
                                userId: interaction.user.id,
                                itemId: Items.fishing_rod
                            }
                        }
                    });

                    await redis.del(`inventory:${interaction.user.id}:fishing_rod`);

                    // Mensagem de vara quebrada
                    const components = [
                        createContainer({
                            accentColor: settings.colors.danger,
                            components: [
                                `${icon.denied} | Sua vara de pescar quebrou durante a pescaria!`
                            ],
                        }),
                        createContainer({
                            accentColor: settings.colors.success,
                            components: [
                                `Você finalizou a pesca e pescou **${caughtCount}** peixe(s).`
                            ]
                        })
                    ];

                    interaction.editReply({ components, flags: ["IsComponentsV2"] });
                    return;
                }

                // SE A VARA NÃO QUEBROU, CONTINUAR PESCANDO
                fish.caught = true;

                // Atualizar dados no Redis
                await redis.setex(`fishing:session:${interaction.user.id}`, 300, JSON.stringify(fishs));

                // Atualizar durabilidade da vara
                await redis.set(`inventory:${interaction.user.id}:fishing_rod`, JSON.stringify(fishingRod));

                if (fishingRod.durability !== null) {
                    await prisma.inventory.update({
                        where: {
                            userId_itemId: {
                                userId: interaction.user.id,
                                itemId: Items.fishing_rod
                            }
                        },
                        data: {
                            durability: fishingRod.durability
                        }
                    });
                }

                // Atualizar interface
                interaction.editReply(menus.fishing.fishingMenu(userId, x, y, fishs, {
                    durability: fishingRod.durability ?? -1,
                    expiresAt: fishingRod.expiresAt
                }));

                interaction.followUp(res.success(`${icon.success} | Você pescou um peixe! Durabilidade restante: ${fishingRod.durability ?? "∞"}`));
                return;
            }
            case "cancel": {
                await redis.del(`fishing:session:${interaction.user.id}`);
                interaction.editReply(resv2.danger(`${icon.success} | Você cancelou a pesca!`));
                return;
            }
            case "end": {
                const fishs = JSON.parse(raw) as FishPosition[];
                const caughtCount = fishs.filter(fish => fish.caught).length;

                await redis.del(`fishing:session:${interaction.user.id}`);
                const totalFishRaw = await redis.get(`fishing:fish:quantity`);
                const totalFish = totalFishRaw ? parseInt(totalFishRaw) : 20;
                const newTotalFish = Math.max(0, totalFish - caughtCount);
                await redis.setex(`fishing:fish:quantity`, 3600, newTotalFish.toString());
                interaction.editReply(resv2.success(`${icon.success} | Você finalizou a pesca! e pescou **${caughtCount}** peixe(s).`));
                return;
            }
        }
    },
});