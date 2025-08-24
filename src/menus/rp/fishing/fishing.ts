import { settings } from "#settings";
import { brBuilder, createContainer, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

type FishPosition = { x: number, y: number, caught: boolean };

export function fishingMenu<R>(userId: string, x: number, y: number, fishPositions: FishPosition[], fishingRod: { durability: number, expiresAt: Date | null }): R {
    const maxX = 16;
    const maxY = 6;
    
    // Criar o tabuleiro visual
    const createBoard = () => {
        let board = "";
        
        for (let row = 0; row < maxY; row++) {
            let rowString = "";
            
            for (let col = 0; col < maxX; col++) {
                // Verificar se há um peixe nesta posição
                const fishHere = fishPositions.find(fish => 
                    fish.x === col && fish.y === row && !fish.caught
                );
                
                // Verificar se é a posição do anzol
                const isHookHere = col === x && row === y;
                
                if (isHookHere) {
                    // Verificar se o anzol pegou um peixe
                    const caughtFish = fishPositions.find(fish => 
                        fish.x === col && fish.y === row
                    );
                    
                    if (caughtFish) {
                        rowString += "🎣"; // Anzol com peixe
                    } else {
                        rowString += "🪝"; // Anzol sozinho
                    }
                } else if (fishHere) {
                    rowString += "🐟"; // Peixe
                } else {
                    rowString += "🟦"; // Água
                }
            }
            
            board += rowString + "\n";
        }
        
        return board;
    };

    // Contar peixes pegos
    const caughtCount = fishPositions.filter(fish => fish.caught).length;
    const totalFish = fishPositions.length;

    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            "## 🎣 Pescaria",
            `**Peixes pegos:** ${caughtCount}/${totalFish}`,
            `**Posição:** X:${x + 1}, Y:${y + 1}`,
            `**Durabilidade:** ${fishingRod.durability}`,
            fishingRod.expiresAt && `**Expira em:** ${time(fishingRod.expiresAt, "R")}`,
            "```",
            createBoard(),
            "```",
            "Use os botões para mover o anzol e pegar peixes!"
        ),
        createRow(
            // Botão para esquerda
            new ButtonBuilder({
                customId: `fishing/move/left/${x}/${y}/${userId}`,
                label: "⬅️",
                style: ButtonStyle.Secondary,
                disabled: x <= 0,
            }),
            // Botão para cima
            new ButtonBuilder({
                customId: `fishing/move/up/${x}/${y}/${userId}`,
                label: "⬆️",
                style: ButtonStyle.Secondary,
                disabled: y <= 0,
            }),
            // Botão para baixo
            new ButtonBuilder({
                customId: `fishing/move/down/${x}/${y}/${userId}`,
                label: "⬇️",
                style: ButtonStyle.Secondary,
                disabled: y >= maxY - 1,
            }),
            // Botão para direita
            new ButtonBuilder({
                customId: `fishing/move/right/${x}/${y}/${userId}`,
                label: "➡️",
                style: ButtonStyle.Secondary,
                disabled: x >= maxX - 1,
            }),
            // Botão de pescar
            new ButtonBuilder({
                customId: `fishing/action/catch/${x}/${y}/${userId}`,
                label: "Pescar",
                style: ButtonStyle.Success,
                emoji: "🎣",
                disabled: !fishPositions.some(fish => 
                    fish.x === x && fish.y === y && !fish.caught
                )
            })
        )
    );

    const rows = [
        createRow(
            // Botão de cancelar
            new ButtonBuilder({
                customId: `fishing/action/cancel/${x}/${y}/${userId}`,
                label: "Cancelar",
                style: ButtonStyle.Danger,
                emoji: "⏹️",
            }),
            new ButtonBuilder({
                customId: `fishing/action/end/${x}/${y}/${userId}`,
                label: "Finalizar",
                style: ButtonStyle.Success,
                emoji: "🏁",
                disabled: caughtCount === 0,
            })
        ),
    ]

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, ...rows]
    } satisfies InteractionReplyOptions) as R;
}
