import { prisma } from "#database";
import { tryviaApiRequest } from "./tryviaApiRequest.js";
import { mapApiDifficultyToPrisma, sanitizeQuestionText, questionExists } from "./tryviaUtils.js";

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
        const apiResponse = await tryviaApiRequest(50);
        
        if (apiResponse.response_code !== 0) {
            throw new Error(`API retornou código: ${apiResponse.response_code}`);
        }

        for (const questionData of apiResponse.results) {
            result.totalProcessed++;
            
            try {
                const sanitizedQuestion = sanitizeQuestionText(questionData.question);
                
                if (await questionExists(sanitizedQuestion)) {
                    result.skipped++;
                    continue;
                }

                await prisma.tryviaQuestions.create({
                    data: {
                        question: sanitizedQuestion,
                        difficulty: mapApiDifficultyToPrisma(questionData.difficulty),
                        tags: [questionData.category],
                        correctAnswer: questionData.correct_answer,
                        correctAnswersVariation: [questionData.correct_answer],
                        incorrectAnswers: questionData.incorrect_answers,
                        status: 'PENDING',
                        origin: 'API'
                    }
                });

                result.saved++;
                
            } catch (error) {
                console.error(`Erro processando pergunta:`, error);
                result.errors++;
            }
        }

        return result;

    } catch (error) {
        console.error('Erro ao processar API:', error);
        throw error;
    }
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