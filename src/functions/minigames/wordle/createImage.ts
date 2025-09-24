import { Canvas, GlobalFonts } from "@napi-rs/canvas";
import { join } from "node:path";

export async function wordleCreateImage(word: string, attempts: string[]): Promise<Buffer> {
    // Validar palavra
    if (word.length < 4 || word.length > 6) {
        throw new Error("A palavra deve ter entre 4 e 6 letras.");
    }

    const canvas = new Canvas(800, 1200);
    const ctx = canvas.getContext("2d");

    // Fundo
    ctx.fillStyle = "#74351A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    const path = join(__rootname, "assets/fonts");
    GlobalFonts.loadFontsFromDir(path);
    ctx.fillStyle = "#ffffff";
    ctx.font = "96px Joan";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText("Termo", 400, 65);

    // Configurações dinâmicas
    const boxPerLine = word.length; // Número de caixas por linha
    const totalLines = 5; // Manter 5 linhas
    const boxSizeY = 155; // Altura fixa
    const paddingY = 30; // Espaçamento vertical
    const lineBaseY = 206; // Margem superior (ajustado para centralizar)
    const boxRadius = 21; // Raio dos cantos

    // Ajustar tamanho e espaçamento horizontal
    let boxSizeX: number;
    let paddingX: number;
    let lineBaseX: number;

    switch (boxPerLine) {
        case 4:
            boxSizeX = 120;
            paddingX = 80;
            lineBaseX = 40;
            break;
        case 5:
            boxSizeX = 115;
            paddingX = 38;
            lineBaseX = 36;
            break;
        case 6:
            boxSizeX = 100;
            paddingX = 20;
            lineBaseX = 40;
            break;
        default:
            throw new Error("Número inválido de letras.");
    }

    // Função para desenhar caixas
    const drawRoundedBox = (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        type: "neutral" | "success" | "different" = "neutral"
    ) => {
        ctx.save();
        ctx.fillStyle =
            type === "neutral" ? "#402116" :
            type === "success" ? "#74dd6b" : "#f72c2c";
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };

    // Função para desenhar letras
    const drawLetter = (
        x: number,
        y: number,
        width: number,
        height: number,
        letter: string
    ) => {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "48px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(letter.toUpperCase(), x + width / 2, y + height / 2);
        ctx.restore();
    };

    // Lógica de coloração para letras
    for (let line = 0; line < totalLines; line++) {
        const attempt = attempts[line]?.slice(0, boxPerLine).padEnd(boxPerLine, "") || "";
        const wordArray = word.split("");
        const types: ("neutral" | "success" | "different")[] = Array(boxPerLine).fill("neutral");

        // Contar ocorrências de cada letra na palavra-alvo
        const letterCounts: { [key: string]: number } = {};
        for (const letter of wordArray) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }

        // Passo 1: Identificar letras na posição correta
        for (let i = 0; i < boxPerLine; i++) {
            if (attempt[i] && attempt[i] === word[i]) {
                types[i] = "success";
                letterCounts[attempt[i]]--;
                wordArray[i] = "";
            }
        }

        // Passo 2: Identificar letras na palavra, mas na posição errada
        for (let i = 0; i < boxPerLine; i++) {
            if (attempt[i] && types[i] !== "success" && wordArray.includes(attempt[i]) && letterCounts[attempt[i]] > 0) {
                types[i] = "different";
                letterCounts[attempt[i]]--;
                wordArray[wordArray.indexOf(attempt[i])] = "";
            }
        }

        // Desenhar caixas e letras
        for (let box = 0; box < boxPerLine; box++) {
            const x = lineBaseX + (boxSizeX + paddingX) * box;
            const y = lineBaseY + (boxSizeY + paddingY) * line;
            const type = types[box];
            drawRoundedBox(x, y, boxSizeX, boxSizeY, boxRadius, type);

            const letter = attempt[box];
            if (letter) {
                drawLetter(x, y, boxSizeX, boxSizeY, letter);
            }
        }
    }

    return await canvas.encode("png");
}