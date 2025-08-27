import { prisma } from "#database";
import { theTriviaApiRequest, tryviaApiRequest } from "./tryviaApiRequest.js";
import { mapApiDifficultyToPrisma, sanitizeQuestionText, questionExists } from "./tryviaUtils.js";
import { translate } from "@vitalets/google-translate-api";

interface PipelineResult {
    totalProcessed: number;
    saved: number;
    skipped: number;
    errors: number;
}

// Função para traduzir texto
async function translateToPortuguese(text: string): Promise<string> {
    try {
        const result = await translate(text, { to: 'pt' });
        return result.text;
    } catch (error) {
        console.error('Erro ao traduzir texto:', error);
        return text; // Retorna o texto original em caso de erro
    }
}

// Função para traduzir array de respostas
async function translateAnswers(answers: string[]): Promise<string[]> {
    try {
        const translatedAnswers = await Promise.all(
            answers.map(async (answer) => {
                const translated = await translateToPortuguese(answer);
                return translated;
            })
        );
        return translatedAnswers;
    } catch (error) {
        console.error('Erro ao traduzir respostas:', error);
        return answers;
    }
}

export async function tryviaPipeline(): Promise<void> {
    setInterval(async () => {
        try {
            console.log('🚀 Iniciando coleta automática de perguntas...');
            
            const result = await processApiQuestions();
            
            console.log(`✅ Coleta concluída: ${result.saved} novas, ${result.skipped} existentes, ${result.errors} erros`);
            
        } catch (error) {
            console.error('❌ Erro crítico no pipeline:', error);
        }
    }, 1000 * 60 * 5);
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
        
        const tryviaApiFormatted = tryviaApiResponse.results.map(item => ({
            question: sanitizeQuestionText(item.question),
            correctAnswer: item.correct_answer,
            incorrectAnswers: item.incorrect_answers,
            tags: [item.category],
            difficulty: item.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'
        }));
        
        const putInDbTryviaApi = async () => {
            for (const item of tryviaApiFormatted) {
                const exists = await questionExists(item.question);
                if (exists) {
                    result.skipped++;
                    continue;
                }
                try {
                    await prisma.tryviaQuestions.create({
                        data: {
                            question: item.question,
                            correctAnswer: item.correctAnswer,
                            incorrectAnswers: item.incorrectAnswers,
                            difficulty: item.difficulty,
                            tags: item.tags,
                            origin: "API",
                            status: "APPROVED"
                        }
                    });
                    result.saved++;
                } catch (error) {
                    console.error('Erro ao salvar pergunta do Tryvia API:', error);
                    result.errors++;
                }
            }
        };

        const opentTdbApiFormatted = tryviaOpenTdbResponse.results.map(item => ({
            question: sanitizeQuestionText(item.question),
            correctAnswer: item.correct_answer,
            incorrectAnswers: item.incorrect_answers,
            tags: [item.category],
            difficulty: mapApiDifficultyToPrisma(item.difficulty)
        }));
        
        const putInDbOpenTdbApi = async () => {
            for (const item of opentTdbApiFormatted) {
                const translatedQuestion = await translateToPortuguese(item.question);
                const exists = await questionExists(translatedQuestion);
                if (exists) {
                    result.skipped++;
                    continue;
                }
                const translatedCorrectAnswer = await translateToPortuguese(item.correctAnswer);
                const translatedIncorrectAnswers = await translateAnswers(item.incorrectAnswers);
                try {
                    await prisma.tryviaQuestions.create({
                        data: {
                            question: translatedQuestion,
                            correctAnswer: translatedCorrectAnswer,
                            incorrectAnswers: translatedIncorrectAnswers,
                            difficulty: item.difficulty,
                            tags: item.tags,
                            origin: "API",
                            status: "PENDING"
                        }
                    });
                    result.saved++;
                } catch (error) {
                    console.error('Erro ao salvar pergunta do Tryvia API:', error);
                    result.errors++;
                }
            }
        };

        const putInDbTheTriviaApi = async () => {
            for (const item of theTriviaApiResponse) {
                try {
                    // Traduzir pergunta e respostas
                    const translatedQuestion = await translateToPortuguese(item.question.text);
                    const translatedCorrectAnswer = await translateToPortuguese(item.correctAnswer);
                    const translatedIncorrectAnswers = await translateAnswers(item.incorrectAnswers);
                    
                    const formattedItem = {
                        question: sanitizeQuestionText(translatedQuestion),
                        correctAnswer: translatedCorrectAnswer,
                        incorrectAnswers: translatedIncorrectAnswers,
                        tags: item.tags,
                        difficulty: mapApiDifficultyToPrisma(item.difficulty)
                    };

                    const exists = await questionExists(formattedItem.question);
                    if (exists) {
                        result.skipped++;
                        continue;
                    }

                    await prisma.tryviaQuestions.create({
                        data: {
                            question: formattedItem.question,
                            correctAnswer: formattedItem.correctAnswer,
                            incorrectAnswers: formattedItem.incorrectAnswers,
                            difficulty: formattedItem.difficulty,
                            tags: formattedItem.tags,
                            origin: "API",
                            status: "PENDING"
                        }
                    });
                    result.saved++;
                } catch (error) {
                    console.error('Erro ao processar/traduzir pergunta do The Trivia API:', error);
                    result.errors++;
                }
            }
        };

        await Promise.all([
            putInDbTryviaApi(),
            putInDbOpenTdbApi(),
            putInDbTheTriviaApi()
        ]);

        result.totalProcessed = result.saved + result.skipped + result.errors;
        
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