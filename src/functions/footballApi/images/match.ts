import { FootballLeague, FootballMatch, FootballTeam } from "#prisma";
import { settings } from "#settings";
import { MatchStatistics } from "#types/footballData/match.js";
import { Canvas, CanvasRenderingContext2D, GlobalFonts, Image } from "@napi-rs/canvas";
import { join } from "node:path";

type MatchType = FootballMatch & {
    homeTeam: FootballTeam & { statistics?: MatchStatistics };
    awayTeam: FootballTeam & { statistics?: MatchStatistics };
    competition: FootballLeague;
    elapsed: string;
};

async function loadImage(url: string): Promise<Image | null> {
    return new Promise<Image | null>((resolve) => {
        const img = new Image();

        img.onload = () => resolve(img);          // sucesso
        img.onerror = () => resolve(null);        // falha (ex: 404)

        img.src = url;                            // dispara o carregamento
    });
}

export async function createMatchImage(match: MatchType) {
    const canvas = new Canvas(1200, 800);
    const ctx = canvas.getContext("2d");

    // Registrar fontes
    const fontPath = join(__rootname, "assets/fonts");
    GlobalFonts.loadFontsFromDir(fontPath);

    const fuchsia = settings.colors.fuchsia; // Ex: "#FF69B4"
    const pinkBar = "#FFACED";
    const grayBar = "#D9D9D9";

    // --- Função para desenhar retângulo arredondado ---
    function drawRoundedRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        radii: { tl?: number; tr?: number; br?: number; bl?: number } = {}
    ) {
        const { tl = 0, tr = 0, br = 0, bl = 0 } = radii;
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + w - tr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
        ctx.lineTo(x + w, y + h - br);
        ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        ctx.lineTo(x + bl, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
        ctx.closePath();
    }

    // --- Fundo ---
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const homeCrest = match.homeTeam.crest ? await loadImage(match.homeTeam.crest) : null;
    const awayCrest = match.awayTeam.crest ? await loadImage(match.awayTeam.crest) : null;

    // --- Desenhar escudo ou placeholder ---
    function drawTeamLogo(x: number, crest: Image | null) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, 200, 80, 0, Math.PI * 2);
        ctx.clip(); // Recorta imagem no círculo

        if (crest) {
            const scale = Math.max(160 / crest.width, 160 / crest.height);
            const w = crest.width * scale;
            const h = crest.height * scale;
            ctx.drawImage(crest, x - w / 2, 200 - h / 2, w, h);
        } else {
            ctx.fillStyle = "#f0f0f0";
            ctx.fill();
            ctx.fillStyle = fuchsia;
            ctx.font = "100px Enriqueta";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", x, 200);
        }

        ctx.restore();

        // Borda rosa
        ctx.strokeStyle = fuchsia;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, 200, 80, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawTeamLogo(300, homeCrest);
    drawTeamLogo(900, awayCrest);

    // --- Odds ---
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Enriqueta";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`odd ${match.oddsHomeWin?.toFixed(1) ?? "?.?"}`, 300, 100);
    ctx.fillText(`odd ${match.oddsDraw?.toFixed(1) ?? "?.?"}`, 600, 100);
    ctx.fillText(`odd ${match.oddsAwayWin?.toFixed(1) ?? "?.?"}`, 900, 100);

    // --- Placar ou tempo ---
    ctx.font = "100px 'Fredoka One'";
    if (match.status === "IN_PLAY" && match.elapsed) {
        const minutes = match.elapsed.toString().padStart(2, "0");
        const seconds = "00";
        ctx.fillText(minutes, 540, 200);
        ctx.font = "60px 'Fredoka One'";
        ctx.fillText(":", 600, 200);
        ctx.font = "100px 'Fredoka One'";
        ctx.fillText(seconds, 660, 200);
    } else {
        const homeGoals = match.goalsHome ?? "?";
        const awayGoals = match.goalsAway ?? "?";
        ctx.fillText(`${homeGoals}`, 450, 200);
        ctx.fillText("x", 600, 200);
        ctx.fillText(`${awayGoals}`, 750, 200);
    }

    // --- Nomes dos times ---
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px 'Ek Mukta'";
    const homeName = match.homeTeam.name;
    const awayName = match.awayTeam.name;
    const homeWidth = ctx.measureText(homeName).width;
    const awayWidth = ctx.measureText(awayName).width;

    ctx.fillText(homeName, 300, 320);
    ctx.fillText(awayName, 900, 320);

    // Linhas abaixo dos nomes
    ctx.strokeStyle = fuchsia;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300 - homeWidth / 2, 335);
    ctx.lineTo(300 + homeWidth / 2, 335);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(900 - awayWidth / 2, 335);
    ctx.lineTo(900 + awayWidth / 2, 335);
    ctx.stroke();

    // --- Título Estatísticas ---
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Enriqueta";
    ctx.fillText("Estatisticas", 600, 370);

    // --- Estatísticas com barra de progresso ---
    const stats = [
        { label: "Chutes ao Gol", key: "shots_on_goal" as const },
        { label: "Chutes totais", key: "shots" as const },
        { label: "Escanteios", key: "corner_kicks" as const },
        { label: "Faltas cometidas", key: "fouls" as const },
        { label: "Impedimentos", key: "offsides" as const },
        { label: "Posse de Bola", key: "ball_possession" as const, isPercent: true },
        { label: "Cartões Amarelos", key: "yellow_cards" as const },
        { label: "Cartões Vermelhos", key: "red_cards" as const },
    ];

    stats.forEach((stat, index) => {
        const homeVal = match.homeTeam.statistics?.[stat.key] ?? 0;
        const awayVal = match.awayTeam.statistics?.[stat.key] ?? 0;
        const total = homeVal + awayVal || 1; // Evita divisão por zero
        const homePercent = (homeVal / total) * 100;
        const awayPercent = (awayVal / total) * 100;

        const y = 420 + index * 50;
        const barHeight = 40;
        const radius = 20;
        const leftX = 200;
        const middleX = 280;
        const rightX = 920;
        const barWidth = 640;

        // --- Fundo cinza (toda a barra) ---
        ctx.fillStyle = grayBar;
        drawRoundedRect(ctx, middleX, y - barHeight / 2, barWidth, barHeight, {
            tl: radius,
            tr: radius,
            bl: radius,
            br: radius,
        });
        ctx.fill();

        // --- Barra rosa (proporcional ao maior valor) ---
        const winnerIsHome = homeVal >= awayVal;
        const draw = homeVal === awayVal;
        const winnerPercent = winnerIsHome ? homePercent : awayPercent;
        const barFillWidth = (barWidth * winnerPercent) / 100;

        ctx.fillStyle = pinkBar;
        if (!draw) {
            if (winnerIsHome) {
                drawRoundedRect(ctx, middleX, y - barHeight / 2, barFillWidth, barHeight, {
                    tl: radius,
                    tr: radius,
                    bl: radius,
                    br: radius,
                });
            } else {
                drawRoundedRect(ctx, middleX + barWidth - barFillWidth, y - barHeight / 2, barFillWidth, barHeight, {
                    tl: radius,
                    tr: radius,
                    bl: radius,
                    br: radius,
                });
            }
        }
        ctx.fill();

        // --- Valores nos cantos ---
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px Enriqueta";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const homeText = stat.isPercent ? `${homeVal}%` : `${homeVal}`;
        const awayText = stat.isPercent ? `${awayVal}%` : `${awayVal}`;

        ctx.fillText(homeText, leftX + 40, y);
        ctx.fillText(awayText, rightX + 40, y);

        // --- Label no centro ---
        ctx.fillStyle = "#000000";
        ctx.fillText(stat.label, 600, y);
    });

    return await canvas.encode("png");
}