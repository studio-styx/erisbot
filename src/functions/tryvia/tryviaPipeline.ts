import { prisma } from "#database";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { theTriviaApiRequest, tryviaApiRequest } from "./tryviaApiRequest.js";
import { TriviaAPIItemResponse, TryviaApiResponseData } from "#types/tryviaApiResponse.js";
import { WebhookClient } from "discord.js";
import { env, settings } from "#settings";
import { EnhancedGenerateContentResponse, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_CHATBOT_API_KEY);

const threshold = HarmBlockThreshold.BLOCK_NONE;

const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold }
];


const gemini = {
    text: genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings }),
    getText(response: EnhancedGenerateContentResponse){
        try {
            return { success: true, text: response.text() }
        } catch (error) {
            return { success: false, error }
        }
    }
}


interface PipelineResult {
    totalProcessed: number;
    saved: number;
    skipped: number;
    errors: number;
}

export async function tryviaPipeline(): Promise<void> {
    setInterval(async () => {
        try {
            console.log('🚀 Iniciando coleta automática de perguntas...');

            const result = await processApiQuestions();

            console.log(`✅ Coleta concluída: ${result.saved} novas, ${result.skipped} existentes/duplicadas, ${result.errors} erros`);

        } catch (error) {
            console.error('❌ Erro crítico no pipeline:', error);
        }
    }, 1000 * 60 * 5);
}

async function getPotentialDuplicates(question: string): Promise<string[]> {
    // Prepara termos para full-text search em português (assume PostgreSQL)
    const terms = question.split(/\s+/).filter(t => t.length > 2).map(t => t + ':*').join(' & ');
    if (!terms) return [];

    try {
        const candidates = await prisma.$queryRaw<Array<{ question: string }>>`
            SELECT "question" FROM "tryviaQuestions"
            WHERE to_tsvector('portuguese', "question") @@ to_tsquery('portuguese', ${terms})
            LIMIT 5;
        `;
        return candidates.map(c => c.question);
    } catch (error) {
        console.error('Erro ao buscar duplicatas potenciais:', error);
        return [];
    }
}

interface DuplicateCheckResponse {
    isDuplicate: boolean;
    justificativa: string;
    similarTo?: string;
}

async function geminiIsDuplicate(
    newQuestion: string,
    existingQuestions: string[],
    retry = 0
): Promise<DuplicateCheckResponse> {
    const prompt = brBuilder(
        "Você é um avaliador de similaridade de perguntas de trivia.",
        "",
        "Regras:",
        "1. Determine se a nova pergunta é semanticamente equivalente a alguma das existentes.",
        "   - Equivalente: pergunta exatamente a mesma coisa, mas possivelmente com palavras diferentes.",
        "   - Não equivalente: mesmo tema, mas pergunta algo diferente.",
        "2. A saída DEVE ser JSON estritamente válido, apenas um objeto.",
        "3. Nunca use Markdown ou ```.",
        "",
        "Formato:",
        `{
            "isDuplicate": true/false,
            "justificativa": "explicação curta",
            "similarTo": "pergunta similar se true, opcional"
        }`,
        "",
        `Nova pergunta: ${newQuestion}`,
        `Perguntas existentes: ${JSON.stringify(existingQuestions, null, 2)}`
    );

    const { response } = await gemini.text.generateContent(prompt);
    const result = gemini.getText(response);

    if (!result.success || !result.text) {
        if (retry < 3) {
            console.warn(`⚠️ Gemini falhou no check de duplicata, retry (${retry + 1}/3)...`);
            await new Promise(res => setTimeout(res, 5000));
            return geminiIsDuplicate(newQuestion, existingQuestions, retry + 1);
        }
        throw new Error("Gemini não retornou resposta válida após 3 tentativas.");
    }

    let cleanText = result.text
        .replace(/```(?:json)?/gi, "")
        .replace(/^`+|`+$/g, "")
        .trim();

    try {
        return JSON.parse(cleanText);
    } catch (err) {
        if (retry < 3) {
            console.warn(`⚠️ Resposta inválida no check de duplicata (não JSON), retry ${retry + 1}/3...`);
            await new Promise(res => setTimeout(res, 5000));
            return geminiIsDuplicate(newQuestion, existingQuestions, retry + 1);
        }
        console.error("Resposta crua do Gemini no check de duplicata:", cleanText);
        throw new Error("Gemini retornou JSON inválido após 3 tentativas.");
    }
}

export async function processApiQuestions(): Promise<PipelineResult> {
    const result: PipelineResult = {
        totalProcessed: 0,
        saved: 0,
        skipped: 0,
        errors: 0
    };

    try {
        const [tryviaApiResponse, tryviaOpenTdbResponse, theTriviaApiResponse] = await Promise.all([
            tryviaApiRequest(20),
            tryviaApiRequest(20),
            theTriviaApiRequest(20)
        ]);

        interface GeminiFormattedItem {
            question: string;
            correctAnswer: string;
            correctAnswersVariations: string[];
            incorrectAnswers: string[];
            tags: string[];
            difficulty: "EASY" | "MEDIUM" | "HARD";
            confianca: number;
            justificativa: string;
        }

        const geminiRequisition = async (
            questions: TryviaApiResponseData | TriviaAPIItemResponse[],
            retry = 0
        ): Promise<GeminiFormattedItem[]> => {
            const prompt = brBuilder(
                "Você é um validador e tradutor de perguntas de trivia.",
                "",
                "Regras obrigatórias:",
                "1. Traduza pergunta e respostas para português brasileiro sem alterar o sentido.",
                "2. Corrija ambiguidades ou erros menores, mas nunca invente conteúdo.",
                "3. Sempre classifique a confiança da questão em um número inteiro de 0 a 10.",
                "4. Status baseado em confiança:",
                "   - 0 → excluir (não confiável, mal formulada ou inválida).",
                "   - 1–7 → pending (aceitável mas duvidosa).",
                "   - 8–10 → aprovado (boa qualidade).",
                "5. Sempre inclua um campo 'justificativa' curto explicando a nota de confiança.",
                "6. Nunca use explicações fora do JSON.",
                "7. Nunca use Markdown ou ```.",
                "8. A saída DEVE ser JSON estritamente válido, apenas um array de objetos.",
                "",
                "Formato esperado de resposta:",
                `
                [
                    {
                        "question": "texto traduzido da pergunta",
                        "correctAnswer": "resposta correta traduzida",
                        "correctAnswersVariations": ["variação 1", "variação 2"],
                        "incorrectAnswers": ["incorreta 1", "incorreta 2"],
                        "tags": ["categoria1", "categoria2"],
                        difficulty: "EASY" | "MEDIUM" | "HARD",
                        "confianca": 0–10,
                        "justificativa": "frase curta explicando a nota"
                    }
                ]
                `,
                "",
                "Agora processe as seguintes perguntas:",
                JSON.stringify(questions, null, 2)
            );

            const { response } = await gemini.text.generateContent(prompt);
            const resultGemini = gemini.getText(response);

            if (!resultGemini.success || !resultGemini.text) {
                if (retry < 3) {
                    console.warn(`⚠️ Gemini falhou, tentando novamente (${retry + 1}/3)...`);
                    await new Promise(res => setTimeout(res, 5000));
                    return geminiRequisition(questions, retry + 1);
                }
                throw new Error("Gemini não retornou resposta válida após 3 tentativas.");
            }

            // Sanitização: remove blocos de markdown e espaços extras
            let cleanText = resultGemini.text
                .replace(/```(?:json)?/gi, "") // remove ```json ou ```
                .replace(/^`+|`+$/g, "")      // remove crases soltas
                .trim();

            try {
                return JSON.parse(cleanText);
            } catch (err) {
                if (retry < 3) {
                    console.warn(`⚠️ Resposta inválida (não JSON), retry ${retry + 1}/3...`);
                    await new Promise(res => setTimeout(res, 5000));
                    return geminiRequisition(questions, retry + 1);
                }
                console.error("Resposta crua do Gemini:", cleanText);
                throw new Error("Gemini retornou JSON inválido após 3 tentativas.");
            }
        };

        const processAndSave = async (
            formattedItems: GeminiFormattedItem[],
            correctVariationsField: 'correctAnswer' | 'correctAnswersVariations'
        ) => {
            for (const item of formattedItems) {
                result.totalProcessed++;
                if (item.confianca === 0) {
                    result.skipped++;
                    continue;
                }

                try {
                    const potentials = await getPotentialDuplicates(item.question);
                    let isDuplicate = false;

                    if (potentials.length > 0) {
                        const dupCheck = await geminiIsDuplicate(item.question, potentials);
                        isDuplicate = dupCheck.isDuplicate;
                        if (isDuplicate) {
                            console.log(`Duplicada detectada: ${item.question} similar a ${dupCheck.similarTo || 'uma existente'}`);
                        }
                    }

                    if (isDuplicate) {
                        result.skipped++;
                        continue;
                    }

                    const variations = correctVariationsField === 'correctAnswer' 
                        ? [item.correctAnswer] 
                        : item.correctAnswersVariations;

                    await prisma.tryviaQuestions.create({
                        data: {
                            question: item.question,
                            correctAnswer: item.correctAnswer,
                            correctAnswersVariation: variations,
                            incorrectAnswers: item.incorrectAnswers,
                            difficulty: item.difficulty,
                            tags: item.tags,
                            origin: "API",
                            status: item.confianca >= 8 ? "APPROVED" : "PENDING"
                        }
                    });
                    result.saved++;
                } catch (error) {
                    console.error('Erro ao processar/salvar pergunta:', error);
                    result.errors++;
                }
            }
        };

        const putInDbTryviaApi = async () => {
            const tryviaApiFormatted = await geminiRequisition(tryviaApiResponse);
            await processAndSave(tryviaApiFormatted, 'correctAnswer');
        };

        const putInDbOpenTdbApi = async () => {
            const opentTdbApiFormatted = await geminiRequisition(tryviaOpenTdbResponse);
            await processAndSave(opentTdbApiFormatted, 'correctAnswersVariations');
        };

        const putInDbTheTriviaApi = async () => {
            const theTriviaApiFormatted = await geminiRequisition(theTriviaApiResponse);
            await processAndSave(theTriviaApiFormatted, 'correctAnswersVariations');
        };

        await Promise.all([
            putInDbTryviaApi(),
            putInDbOpenTdbApi(),
            putInDbTheTriviaApi()
        ]);

        const webhookUrl = env.WEBHOOK_TRYVIA_PIPELINE_URL;
        const webhook = new WebhookClient({ url: webhookUrl });
        try {
            await webhook.send({
                embeds: [createEmbed({
                    color: settings.colors.primary,
                    title: '🤖 Pipeline Results',
                    description: `✅ Saved: ${result.saved}\n⚠️ Skipped: ${result.skipped}\n❌ Errors: ${result.errors}`,
                    timestamp: new Date()
                })],
                username: "Tryvia Pipeline",
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem via webhook:', error);
        } finally {
            webhook.destroy();
        }

    } catch (error) {
        console.error('Erro ao processar API:', error);
        result.errors++;
    }

    return result;
}

// Executar imediatamente se necessário
if (require.main === module) {
    processApiQuestions()
        .then(result => {
            console.log('Processamento manual concluído:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Erro no processamento manual:', error);
            process.exit(1);
        });
}