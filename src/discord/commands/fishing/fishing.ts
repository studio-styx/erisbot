import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { generateFishPositions, icon, res } from "#functions";
import { menus } from "#menus";
import { Prisma } from "#prisma";
import { ApplicationCommandOptionType, ApplicationCommandType, time } from "discord.js";

// Função para inicializar a quantidade de peixes no Redis
async function initializeFishQuantity() {
    const raw = await redis.get(`fishing:fish:quantity`);
    if (!raw) {
        await redis.setex(`fishing:fish:quantity`, 3600, "20");
        return 20;
    }
    return parseInt(raw);
}


// Função para obter a melhor vara disponível
type InventoryWithItem = Prisma.InventoryGetPayload<{
    include: { item: true };
}>;

// Função para obter a melhor vara disponível
function getBestRod(userItems: InventoryWithItem[]): InventoryWithItem | undefined {
    return userItems
        .filter(rod => (rod.expiresAt === null || rod.expiresAt > new Date()) && rod.amount > 0)
        .sort((a, b) => {
            const rarityA = a.item.rarity ?? 0; // A propriedade item agora é reconhecida
            const rarityB = b.item.rarity ?? 0;
            if (rarityA === rarityB) {
                const durabilityA = a.durability ?? Infinity;
                const durabilityB = b.durability ?? Infinity;
                return durabilityB - durabilityA;
            }
            return rarityB - rarityA;
        })[0];
}
createCommand({
    name: "fishing",
    description: "fishing commands",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "es-ES": "pesca",
        "pt-BR": "pesca",
    },
    descriptionLocalizations: {
        "es-ES": "comandos de pesca",
        "pt-BR": "comandos de pesca",
    },
    options: [
        {
            name: "fish",
            description: "fish in a body of water",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "es-ES": "pescar",
                "pt-BR": "pescar",
            },
            descriptionLocalizations: {
                "es-ES": "pescar en un cuerpo de agua",
                "pt-BR": "pescar em um corpo de água",
            },
        },
    ],
    async run(interaction) {
        // Verificar se o subcomando é "fish"
        const subcommand = interaction.options.getSubcommand();
        if (subcommand !== "fish") {
            await interaction.reply(res.danger(`${icon.denied} | Subcomando inválido.`));
            return;
        }

        await interaction.deferReply();

        // Buscar itens do usuário e cooldown
        const [userItems, cooldown] = await prisma.$transaction([
            prisma.inventory.findMany({
                where: {
                    userId: interaction.user.id,
                    item: { type: "fishingRod" },
                },
                include: { item: true },
            }),
            prisma.cooldown.findUnique({
                where: {
                    userId_name: {
                        userId: interaction.user.id,
                        name: "fishing",
                    },
                },
            }),
        ]);

        // Selecionar a melhor vara disponível
        const selectedRod = getBestRod(userItems);

        // Verificar se há uma vara válida
        if (!selectedRod) {
            await interaction.editReply(res.danger(`${icon.denied} | Você precisa de uma vara de pescar válida para pescar!`));
            return;
        }

        // Verificar se a vara está quebrada
        if (selectedRod.durability !== null && selectedRod.durability <= 0) {
            await interaction.editReply(res.danger(`${icon.denied} | Sua vara de pescar está quebrada!`));
            return;
        }

        // Verificar cooldown
        if (cooldown && cooldown.willEndIn > new Date()) {
            await interaction.editReply(res.danger(`${icon.denied} | Você está cansado para pescar, volte novamente ${time(cooldown.willEndIn, "R")}`));
            return;
        }

        // Verificar quantidade de peixes
        const fishQuantity = await initializeFishQuantity();
        if (fishQuantity < 1) {
            await interaction.editReply(res.danger(`${icon.denied} | Não há peixes suficientes para pescar, tente novamente mais tarde!`));
            return;
        }

        // Gerar posições dos peixes
        const fishs = generateFishPositions(Math.min(5, fishQuantity));

        // Armazenar informações no Redis
        await Promise.all([
            redis.set(`inventory:${interaction.user.id}:fishing_rod`, JSON.stringify(selectedRod)),
            redis.setex(`fishing:session:${interaction.user.id}`, 300, JSON.stringify(fishs)),
        ]);

        // Responder com o menu de pesca
        await interaction.editReply(
            menus.fishing.fishingMenu(interaction.user.id, 0, 0, fishs, {
                durability: selectedRod.durability ?? 9999,
                expiresAt: selectedRod.expiresAt,
            })
        );
    },
});