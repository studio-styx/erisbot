import { FootballLeague, FootballMatch, FootballPlayer, FootballTeam } from "#prisma";
import { generateGeminiContent } from "#functions";
import { brBuilder } from "@magicyan/discord";
import z, { ZodError } from "zod";
import { redis } from "#database";

type Team = FootballTeam & {
    players: FootballPlayer[];
};

type League = FootballLeague & {
    round?: string;
};

type Match = FootballMatch & {
    homeTeam: Team;
    awayTeam: Team;
    competition: League;
};

export interface SimulatedMatch {
    score: {
        fullTime: { home: number; away: number };
        halfTime: { home: number; away: number };
        extraTime?: { home: number; away: number };
        penalties?: { home: number; away: number };
    };
    opinion: string;
    explanation: string;
    timeline: Timeline[];
}

interface Timeline {
    minute: number;
    event: Event;
    reason: string;
    player?: string | null;
}

export type Event =
    | "GOAL"
    | "YELLOW_CARD"
    | "RED_CARD"
    | "SUBSTITUTION"
    | "PENALTY"
    | "OWN_GOAL"
    | "MISSED_PENALTY"
    | "FIGHT";

export async function simulateMatchResultWithIa(match: Match): Promise<SimulatedMatch> {
    const key = `football:simulate:${match.id}`;
    const raw = await redis.get(key);
    if (raw) {
        return JSON.parse(raw) as SimulatedMatch;
    }

    const prompt = brBuilder(
        `Você é um simulador especializado em partidas de futebol.`,
        `Seu trabalho é gerar uma simulação completa e coerente de um jogo com base nos dados fornecidos.`,
        ``,
        `### Instruções obrigatórias`,
        `1. Simule os 90 minutos de jogo (e prorrogação, se aplicável) minuto a minuto, gerando eventos realistas.`,
        `2. O resultado final deve refletir o desempenho dos times e dos jogadores.`,
        `3. Todos os eventos devem estar em ordem cronológica crescente.`,
        `4. Cada evento deve conter: minuto, tipo de evento, jogador envolvido (quando fizer sentido) e um motivo curto.`,
        `5. Gere de 10 a 20 eventos principais ao longo do jogo.`,
        `6. O time com mais pontos e jogadores mais fortes tem maior chance de vencer, mas resultados inesperados podem ocorrer.`,
        `7. Retorne **somente** um objeto JSON válido no formato especificado abaixo — sem comentários, texto extra ou formatação fora do objeto.`,
        ``,
        `### Estrutura de retorno esperada (tipo SimulatedMatch)`,
        `Use exatamente as mesmas chaves e tipos mostrados abaixo:`,
        `{
            "score": {
                "fullTime": { "home": number, "away": number },
                "halfTime": { "home": number, "away": number },
                "extraTime": { "home": number, "away": number },
                "penalties": { "home": number, "away": number }
            },
            "opinion": "string com uma análise breve e coerente da partida (2 a 3 frases).",
            "explanation": "string contendo uma explicação breve do por quê você acha que vai ser esse resultado",
            "timeline": [
                {
                    "minute": number,
                    "event": "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "PENALTY" | "OWN_GOAL" | "MISSED_PENALTY" | "FIGHT",
                    "reason": "breve descrição do contexto do evento",
                    "player": "nome do jogador (se aplicável)"
                }
            ]
        }`,
        ``,
        `### Dados da partida`,
        `Competição: ${match.competition.name}`,
        match.competition.round ? `Rodada: ${match.competition.round}` : null,
        `Estádio: ${match.venue || "Desconhecido"}`,
        ``,
        `### Time da Casa`,
        `Nome: ${match.homeTeam.name}`,
        `Pontos de desempenho: ${match.homeTeam.points}`,
        `Jogadores: ${match.homeTeam.players.map(p => `${p.name} (${p.points} pts)`).join(", ")}`,
        ``,
        `### Time Visitante`,
        `Nome: ${match.awayTeam.name}`,
        `Pontos de desempenho: ${match.awayTeam.points}`,
        `Jogadores: ${match.awayTeam.players.map(p => `${p.name} (${p.points} pts)`).join(", ")}`,
        ``,
        `Responda **apenas com o JSON completo e formatado corretamente.**`
    );

    const result = await generateGeminiContent(prompt);

    if (!result.success || !result.text) {
        throw new Error(result.error ?? "Falha ao gerar simulação com IA.");
    }

    // Limpeza e extração segura do JSON
    const cleanText = result.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const jsonMatch = cleanText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
        throw new Error("Nenhum JSON válido encontrado na resposta da IA.");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Esquemas Zod para validação
    const scoreGoalsSchema = z.object({
        home: z.number().min(0, "Placar negativo ou inválido."),
        away: z.number().min(0, "Placar negativo ou inválido.")
    });

    const simulatedMatchSchema = z.object({
        score: z.object({
            fullTime: scoreGoalsSchema,
            halfTime: scoreGoalsSchema,
            extraTime: scoreGoalsSchema.default({ home: 0, away: 0 }),
            penalties: scoreGoalsSchema.default({ home: 0, away: 0 })
        }),
        opinion: z.string().min(1, "Opinião ausente ou vazia."),
        explanation: z.string().min(1, "Explicação ausente ou vazia."),
        timeline: z.array(
            z.object({
                minute: z.number().min(0, "Minuto negativo ou inválido."),
                event: z.enum([
                    "GOAL",
                    "YELLOW_CARD",
                    "RED_CARD",
                    "SUBSTITUTION",
                    "PENALTY",
                    "OWN_GOAL",
                    "MISSED_PENALTY",
                    "FIGHT"
                ]),
                reason: z.string().min(1, "Motivo ausente."),
                player: z.string().optional().nullable()
            })
        )
    });

    try {
        const simulatedMatch = simulatedMatchSchema.parse(parsed);
        await redis.set(key, JSON.stringify(simulatedMatch));
        return simulatedMatch;
    } catch (err) {
        if (err instanceof ZodError) {
            console.error("Erros de validação da simulação:", err.issues.map(issue => issue.message));
        }
        throw err;
    }
}
