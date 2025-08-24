import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { FishPosition, icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { Items } from "#types/items.js";
import { createContainer } from "@magicyan/discord";

createResponder({
    customId: "fishing/move/:direction/:x/:y/:userId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            x: parseInt(params.x),
            y: parseInt(params.y),
            userId: params.userId,
            direction: params.direction as "up" | "down" | "left" | "right"
        }
    },
    async run(interaction, { direction, x, y, userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não é você que está pescando!`))
            return;
        }

        const maxX = 16;
        const maxY = 6;
        const newX = direction === "left" ? Math.max(0, x - 1) :
            direction === "right" ? Math.min(maxX - 1, x + 1) : x;
        const newY = direction === "up" ? Math.max(0, y - 1) :
            direction === "down" ? Math.min(maxY - 1, y + 1) : y;

        await interaction.deferUpdate();
        const raw = await redis.get(`fishing:session:${interaction.user.id}`);
        if (!raw) {
            interaction.editReply(resv2.danger(`${icon.denied} | Sua sessão de pesca expirou! Inicie uma nova pescaria.`));
            return;
        }
        const fishs = JSON.parse(raw) as FishPosition[];

        // Função para obter a vara de pescar
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
                
                // Converter para o tipo correto
                const fishingRod: FishingRod = {
                    userId: fishingRodDb.userId,
                    createdAt: fishingRodDb.createdAt,
                    itemId: fishingRodDb.itemId,
                    amount: fishingRodDb.amount,
                    expiresAt: fishingRodDb.expiresAt,
                    durability: fishingRodDb.durability
                };
                
                await redis.set(`inventory:${interaction.user.id}:fishing_rod`, JSON.stringify(fishingRod));
                return fishingRod;
            }
        }

        const fishingRod = await getUserFishingRod();
        
        // VERIFICAR SE A VARA EXISTE E NÃO ESTÁ QUEBRADA ANTES DE MOVER
        if (!fishingRod) {
            interaction.editReply(resv2.danger(`${icon.denied} | Você não tem uma vara de pescar!`));
            return;
        }

        // Verificar se a vara já está quebrada
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

        // Verificar se a vara expirou
        if (fishingRod.expiresAt && fishingRod.expiresAt < new Date()) {
            interaction.editReply(resv2.danger(`${icon.denied} | Sua vara de pescar expirou!`));
            return;
        }

        // chance aleatória de 20% da durabilidade da vara de pescar diminuir
        const chance = Math.random();
        let rodBroke = false;
        
        if (chance < 0.2 && fishingRod.durability !== null) {
            fishingRod.durability -= 1;
            
            // Atualizar no Redis
            await redis.set(`inventory:${interaction.user.id}:fishing_rod`, JSON.stringify(fishingRod));
            
            // Atualizar no banco de dados
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

            // Verificar se a vara quebrou
            if (fishingRod.durability <= 0) {
                rodBroke = true;
                
                const caughtCount = fishs.filter(fish => fish.caught).length;

                await redis.del(`fishing:session:${interaction.user.id}`);
                
                const totalFishRaw = await redis.get(`fishing:fish:quantity`);
                const totalFish = totalFishRaw ? parseInt(totalFishRaw) : 20;
                const newTotalFish = Math.max(0, totalFish - caughtCount);
                await redis.setex(`fishing:fish:quantity`, 3600, newTotalFish.toString());

                await prisma.inventory.delete({
                    where: {
                        userId_itemId: {
                            userId: interaction.user.id,
                            itemId: Items.fishing_rod
                        }
                    }
                });

                await redis.del(`inventory:${interaction.user.id}:fishing_rod`);
                
                const components = [
                    createContainer({
                        accentColor: settings.colors.danger,
                        components: [
                            `${icon.denied} | Sua vara de pescar quebrou durante o movimento!`
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
        }

        // Se a vara não quebrou, continuar com o movimento
        if (!rodBroke) {
            interaction.editReply(menus.fishing.fishingMenu(
                userId, 
                newX, 
                newY, 
                fishs, 
                { 
                    durability: fishingRod.durability ?? 9999, 
                    expiresAt: fishingRod.expiresAt  
                }
            ));
        }
        
        return;
    },
});