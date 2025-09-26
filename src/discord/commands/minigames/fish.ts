import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { icon, res, resv2 } from "#functions";
import { createSeparator } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "fishing",
    description: "go out to fish for fish",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "fish",
            description: "go out to fish for fish",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "pescar",
                "es-ES": "pescar"
            },
            descriptionLocalizations: {
                "pt-BR": "sair para pescar peixes",
                "es-ES": "salir a pescar peces"
            }
        },
        {
            name: "inventory",
            description: "view your fish inventory",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "inventário",
                "es-ES": "inventario"
            },
            descriptionLocalizations: {
                "pt-BR": "ver seu inventário de peixes",
                "es-ES": "ver tu inventario de peces"
            }
        },
        {
            name: "sell",
            description: "sell a fish from your inventory",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "fish_id",
                    description: "the id of the fish you want to sell",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id_do_peixe",
                        "es-ES": "id_del_pez"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "o id do peixe que você quer vender",
                        "es-ES": "el id del pez que quieres vender"
                    }
                }
            ],
            nameLocalizations: {
                "pt-BR": "vender",
                "es-ES": "vender"
            },
            descriptionLocalizations: {
                "pt-BR": "vender um peixe do seu inventário",
                "es-ES": "vender un pez de tu inventario"
            }
        },
        {
            name: "fishing_rod_buy",
            description: "buy a fishing rod",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "rod_id",
                    description: "the id of the fishing rod you want to buy",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id_da_vara",
                        "es-ES": "id_de_la_caña"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "o id da vara de pesca que você quer comprar",
                        "es-ES": "el id de la caña de pescar que quieres comprar"
                    }
                }
            ],
            nameLocalizations: {
                "pt-BR": "comprar_vara_de_pesca",
                "es-ES": "comprar_caña_de_pescar"
            },
            descriptionLocalizations: {
                "pt-BR": "comprar uma vara de pesca",
                "es-ES": "comprar una caña de pescar"
            }
        }
    ],
    nameLocalizations: {
        "pt-BR": "pescaria",
        "es-ES": "pescaria"
    },
    descriptionLocalizations: {
        "pt-BR": "sair para pescar peixes",
        "es-ES": "salir a pescar peces"
    },
    async autocomplete(interaction) {
        const { options, user } = interaction;
        const subcommand = options.getSubcommand();
        const focusedOption = options.getFocused(true);

        switch (subcommand) {
            case "sell": {
                if (focusedOption.name !== "fish_id") return;

                const userFishs = await prisma.userFish.findMany({
                    where: {
                        userId: user.id,
                        fish: {
                            name: {
                                contains: focusedOption.value,
                                mode: "insensitive"
                            }
                        }
                    },
                    include: {
                        fish: true
                    }
                });

                if (userFishs.length < 1) {
                    return interaction.respond([
                        { name: "Nenhum peixe encontrado", value: "0" }
                    ]);
                }

                // Agrupa por fishId
                const grouped = userFishs.reduce((acc, uf) => {
                    if (!acc[uf.fishId]) {
                        acc[uf.fishId] = { ...uf.fish, quantity: 0 };
                    }
                    acc[uf.fishId].quantity++;
                    return acc;
                }, {} as Record<number, typeof userFishs[0]["fish"] & { quantity: number }>);

                const choices = Object.values(grouped).map((fish) => {
                    const totalPrice = fish.price * fish.quantity;
                    return {
                        name: `${fish.name} (${fish.quantity}x) (Raridade: ${fish.rarity}) - ` +
                            `Unit: ${fish.price.toFixed(2)} stx | Total: ${totalPrice.toFixed(2)} stx`,
                        value: fish.id.toString()
                    };
                });

                return interaction.respond([
                    { name: `Vender todos os peixes (${userFishs.length})`, value: "all" },
                    ...choices.slice(0, 24)
                ]);
            }

            case "fishing_rod_buy": {
                if (focusedOption.name !== "rod_id") return;

                const fishingRods = await prisma.fishingRod.findMany({
                    where: {
                        name: {
                            contains: focusedOption.value,
                            mode: "insensitive"
                        }
                    }
                });
                const choices = fishingRods.map((rod) => ({ name: `${rod.name} (Raridade: ${rod.rarity}) - Preço: ${rod.price.toFixed(2)} stx`, value: rod.id.toString() }));
                if (choices.length < 1) {
                    interaction.respond([
                        { name: "Nenhuma vara de pesca encontrada", value: "0" }
                    ]);
                    return;
                }

                return await interaction.respond(
                    choices.slice(0, 25)
                );
            }
        }
    },
    async run(interaction) {
        const { user, options } = interaction;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "fish": {
                await interaction.deferReply();

                const userFishingRods = await prisma.userFishingRod.findMany({
                    where: {
                        userId: user.id,
                        durability: {
                            gt: 0
                        }
                    },
                    include: {
                        fishingRod: true
                    }
                })

                const rarityOrder = {
                    LEGENDARY: 5,
                    EPIC: 4,
                    RARE: 3,
                    UNCOMUM: 2,
                    COMUM: 1
                };

                const betterFishingRod = userFishingRods
                    .sort((a, b) => {
                        const rarityDiff = rarityOrder[b.fishingRod.rarity] - rarityOrder[a.fishingRod.rarity];
                        if (rarityDiff !== 0) return rarityDiff;
                        return b.durability - a.durability;
                    })[0] ?? null;

                if (!betterFishingRod) {
                    interaction.editReply(res.danger(`${icon.error} | Você não possui uma vara de pesca! Compre uma na loja!`));
                    return;
                }

                const key = `fishing:fishs:${user.id}`;
                const avaibleFishs = await redis.get(key);
                let fishs: number = 20;
                if (avaibleFishs) {
                    fishs = Number(avaibleFishs);
                } else {
                    await redis.setex(key, 60 * 30, "20");
                }
                if (fishs < 1) {
                    interaction.editReply(res.danger(`${icon.error} | Todos os peixes foram pescados! Espere um pouco para tentar novamente!`));
                    return;
                }

                interaction.editReply(resv2.warning(
                    `${icon.warning} | Aperte o botão abaixo pra iniciar a pesca`,
                    new ButtonBuilder({
                        customId: `fishing/start/${user.id}/${betterFishingRod.id}`,
                        label: "Iniciar",
                        style: ButtonStyle.Success,
                    })
                ));
                return;
            }
            case "sell": {
                const fishId = options.getString("fish_id", true);

                await interaction.deferReply();
                if (fishId === "all") {
                    const userFishs = await prisma.userFish.findMany({
                        where: {
                            userId: user.id
                        },
                        include: {
                            fish: true
                        }
                    })

                    if (userFishs.length === 0) {
                        interaction.editReply(res.danger(`${icon.error} | Você não possui nenhum peixe para vender!`));
                        return;
                    }

                    const totalPrice = userFishs.reduce((acc, fish) => acc + fish.fish.price, 0);

                    await prisma.$transaction([
                        prisma.user.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                money: {
                                    increment: totalPrice
                                }
                            }
                        }),
                        prisma.userFish.deleteMany({
                            where: {
                                userId: user.id
                            }
                        })
                    ])

                    interaction.editReply(res.success(`${icon.success} | Você vendeu todos os seus peixes por **${totalPrice.toFixed(2)}** stx!`));
                    return;
                }
                const id = Number(fishId);
                if (isNaN(id)) {
                    interaction.editReply(res.danger(`${icon.error} | O id do peixe deve ser um número ou "all"!`));
                    return;
                }

                const userFish = await prisma.userFish.findMany({
                    where: {
                        fishId: id,
                        userId: user.id
                    },
                    include: {
                        fish: true
                    }
                });

                if (userFish.length === 0) {
                    interaction.editReply(res.danger(`${icon.error} | Você não possui esse peixe no seu inventário!`));
                    return;
                }

                await prisma.$transaction([
                    prisma.userFish.deleteMany({
                        where: {
                            fishId: id,
                            userId: user.id
                        }
                    }),
                    prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            money: {
                                increment: userFish[0].fish.price
                            }
                        }
                    })
                ]);

                interaction.editReply(res.success(`${icon.success} | Você vendeu o(s) peixe(s) **${userFish[0].fish.name}** por **${userFish[0].fish.price.toFixed(2)}** cada! Total: **${(userFish[0].fish.price * userFish.length).toFixed(2)}** stx!`));
                return;
            }
            case "inventory": {
                await interaction.deferReply();

                const [userFishs, userFishingRods] = await prisma.$transaction([
                    prisma.userFish.findMany({
                        where: { userId: user.id },
                        include: { fish: true }
                    }),
                    prisma.userFishingRod.findMany({
                        where: { userId: user.id },
                        include: { fishingRod: true }
                    })
                ]);

                if (userFishs.length < 1 && userFishingRods.length < 1) {
                    interaction.editReply(
                        res.danger(`${icon.error} | Você não possui nenhum peixe ou vara de pesca!`)
                    );
                    return;
                }

                // Agrupar peixes por ID
                const groupedFish = userFishs.reduce((acc, uf) => {
                    const id = uf.fishId;
                    if (!acc[id]) {
                        acc[id] = { ...uf, quantity: 1 };
                    } else {
                        acc[id].quantity++;
                    }
                    return acc;
                }, {} as Record<number, typeof userFishs[number] & { quantity: number }>);

                // Ordenar raridades
                const rarityOrder = ["COMUM", "UNCOMUM", "RARE", "EPIC", "LEGENDARY"];

                const fishList = rarityOrder.map(rarity => {
                    const fishes = Object.values(groupedFish).filter(f => f.fish.rarity === rarity);
                    if (fishes.length === 0) return null;

                    const rarityBlock = fishes.map(f =>
                        `\`${f.fishId}\` - **${f.fish.name}** (${f.quantity}x) (Raridade: **${f.fish.rarity}**) - Preço: **${f.fish.price.toFixed(2)}** stx`
                    ).join("\n");

                    return `__${rarity}:__\n${rarityBlock}`;
                }).filter(Boolean).join("\n\n");

                const fishingRodList = userFishingRods.map(userRod =>
                    `\`${userRod.fishingRodId}\` - **${userRod.fishingRod.name}** (Raridade: **${userRod.fishingRod.rarity}**) - Durabilidade: **${userRod.durability}/${userRod.fishingRod.durability}**`
                ).join("\n");

                interaction.editReply(resv2.success(
                    `## ${icon.info} | Inventário de ${interaction.user.displayName}`,
                    createSeparator(),
                    userFishs.length > 0 ? `**Peixes:**\n${fishList}` : "Nenhum peixe",
                    createSeparator(),
                    userFishingRods.length > 0 ? `**Varas de Pesca:**\n${fishingRodList}` : "Nenhuma vara de pesca"
                ));
                return;
            }

            case "fishing_rod_buy": {
                const fishingRodId = Number(options.getString("rod_id", true));
                if (isNaN(fishingRodId)) {
                    interaction.editReply(res.danger(`${icon.error} | O id da vara de pesca deve ser um número!`));
                    return;
                }

                await interaction.deferReply();

                const [fishingRod, userData] = await prisma.$transaction([
                    prisma.fishingRod.findUnique({
                        where: {
                            id: fishingRodId
                        }
                    }),
                    prisma.user.upsert({
                        where: {
                            id: user.id
                        },
                        create: {
                            id: user.id
                        },
                        update: {}
                    })
                ])

                if (!fishingRod) {
                    interaction.editReply(res.danger(`${icon.error} | Vara de pesca não encontrada!`));
                    return;
                }

                if (userData.money.toNumber() < fishingRod.price) {
                    interaction.editReply(res.danger(`${icon.error} | Você não tem dinheiro suficiente para comprar essa vara de pesca! você precisa de mais **${(fishingRod.price - userData.money.toNumber()).toFixed(2)}** stx!`));
                    return;
                }

                const userHasRod = await prisma.userFishingRod.findUnique({
                    where: {
                        userId_fishingRodId: {
                            userId: user.id,
                            fishingRodId: fishingRodId
                        }
                    }
                });

                if (userHasRod) {
                    interaction.editReply(res.danger(`${icon.error} | Você já possui essa vara de pesca!`));
                    return;
                }

                await prisma.$transaction([
                    prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            money: {
                                decrement: fishingRod.price
                            }
                        }
                    }),
                    prisma.userFishingRod.create({
                        data: {
                            userId: user.id,
                            fishingRodId: fishingRodId,
                            durability: fishingRod.durability
                        }
                    })
                ]);

                interaction.editReply(res.success(`${icon.success} | Você comprou a vara de pesca **${fishingRod.name}** por **${fishingRod.price.toFixed(2)}** stx!`));
                return;
            }
        }
    }
});