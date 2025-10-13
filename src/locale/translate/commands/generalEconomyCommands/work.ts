import { getRandomValue, icon } from "#functions";
import { Company } from "#prisma";
import { brBuilder } from "@magicyan/discord";
import { time } from "discord.js";

export default {
    ptbr: {
        basePrompts: (userName: string, company: Company, expectations: string, hasEasierSkill: boolean) => {
            const basePrompts = [
                brBuilder(
                    `O usuário ${userName} está trabalhando em sua empresa.`,
                    `Crie um desafio realista com base nas seguintes informações:`,
                    ``,
                    `Nome da empresa: ${company.name}`,
                    `Descrição: ${company.description}`,
                    `Dificuldade: ${company.difficulty} (1 = muito fácil, 10 = muito difícil)`,
                    `Expectativas nos funcionários: ${expectations}`,
                    ``,
                    `Gere uma simulação de situação que poderia ocorrer no dia a dia de trabalho, de acordo com o nível de dificuldade. A situação deve exigir que o usuário diga como reagiria.`,
                    `Não é uma pergunta de entrevista.`,
                    ``,
                    `Retorne apenas a pergunta, sem explicações, sem aspas e sem comentários adicionais.`
                ),

                brBuilder(
                    `Você é ${userName}, funcionário da empresa ${company.name}.`,
                    `Sua empresa é descrita assim: ${company.description}`,
                    `Ela espera de seus funcionários: ${expectations}`,
                    ``,
                    `Crie uma situação inesperada ou desafiadora que possa acontecer nesse ambiente.`,
                    `Use a dificuldade (${company.difficulty}) para ajustar o nível de pressão ou complexidade.`,
                    ``,
                    `Descreva a situação como se estivesse acontecendo agora e peça que o usuário diga como reagiria.`,
                    ``,
                    `Apenas a pergunta, sem explicações, aspas ou comentários.`
                ),

                brBuilder(
                    `Simule um evento de trabalho para ${userName}, empregado da empresa ${company.name}.`,
                    `Detalhes: ${company.description}`,
                    `Expectativas: ${expectations}`,
                    `Dificuldade: ${company.difficulty}`,
                    ``,
                    `Crie um desafio típico do ambiente profissional, adequado à dificuldade.`,
                    `A situação deve exigir uma decisão prática, não ser uma pergunta de entrevista.`,
                    ``,
                    `Retorne somente a pergunta, de forma direta.`
                )
            ];

            const easierPrompts = [
                brBuilder(
                    `O usuário ${userName} está trabalhando na empresa ${company.name}.`,
                    `Seu pet reduziu a complexidade do desafio de hoje 🐾`,
                    ``,
                    `Crie uma situação mais simples, cotidiana, relacionada ao ambiente descrito:`,
                    `Descrição: ${company.description}`,
                    `Expectativas: ${expectations}`,
                    ``,
                    `A dificuldade deve ser reduzida (ex.: um pequeno imprevisto ou tarefa inesperada, não um problema complexo).`,
                    ``,
                    `Peça que o usuário diga como reagiria, sem explicações adicionais.`
                ),

                brBuilder(
                    `Simule um pequeno desafio no dia de trabalho de ${userName} na empresa ${company.name}.`,
                    `O pet do usuário está ajudando a tornar as coisas mais fáceis hoje 🐾`,
                    ``,
                    `Crie uma situação leve, mas ainda plausível para um ambiente profissional com essas características:`,
                    `Descrição: ${company.description}`,
                    `Expectativas: ${expectations}`,
                    ``,
                    `A dificuldade deve ser visivelmente menor que ${company.difficulty}, com foco em tarefas rotineiras ou problemas simples.`,
                    ``,
                    `Apenas a pergunta final, direta e clara.`
                )
            ];

            const pool = hasEasierSkill ? easierPrompts : basePrompts;
            return getRandomValue(pool);
        },
        iaIsGenerating: `${icon.denied} | A ia está gerando uma responda pra você. tente novamente mais tarde`,
        alreadyAsInASituation: `${icon.denied} | Você está participando de um desafio, aguarde ele expirar ou termine ele pra poder usar esse comando novamente.`,
        doNotHaveWork: (commandId: string) => `${icon.Eris_shy} | Você não tem um emprego! use o comando **</jobs search:${commandId}>** para encontrar um emprego!`,
        cooldown: (cooldown: Date) => `${icon.denied} | Você já trabalhou hoje. Tente novamente ${time(cooldown, "R")}`,
        situationOccured: `${icon.waiting_white} | Um novo desafio apareceu! por favor aguarde um instante.`,
        expectationsFormatted: (expectation: string[] | { level: number, skill: string }[]) => {
            let companyExpectationsFormatted: string;

            if (Array.isArray(expectation)) {
                if (typeof expectation[0] === "string") {
                    companyExpectationsFormatted = expectation.join(", ").replace(/, ([^,]*)$/, " e $1");
                } else {
                    companyExpectationsFormatted = expectation
                        .map((e) =>
                            typeof e === "object" && "skill" in e
                                ? `Habilidade: ${e.skill}, Nível: ${e.level}`
                                : `Não foi possivel formatar essa expectativa`
                        )
                        .join(", ");
                }
            } else {
                companyExpectationsFormatted = `A empresa não tem expectativas definidas.`;
            }

            return companyExpectationsFormatted;
        },
        log: (wage: number) => `Trabalhou e recebeu seu salário de: **${wage}**`,
        logApiError: `Ocorreu um erro ao fazer requisição a api do gemini`,
        apiErrorMessage: (wage: number) => `${icon.Eris_cry} | Ocorreu um erro ao gerar o desafio, por isso você recebeu o salário normal de: ${wage}`,
        situation: {
            container: {
                title: brBuilder(
                    `## Um novo desafio surgiu! ${icon.Eris_enchanted_left}`,
                    "Responda a pergunta abaixo, como você reagiria a essa situação?",
                    "-# ╰ obs: se você responder corretamente pode até ganhar um aumento hoje!"
                ),
                button: "Responder"
            }
        },
        message: (money: number, xp: number, wage: number) => brBuilder(
            `## Você trabalhou e recebeu seu salário de: **${wage}** ${icon.Eris_ok_left}`,
            `> Você agora possui: **${money}** styx em sua carteira!`,
            `> E possui: **${xp}** xp!`,
        ),
        error: `${icon.Eris_cry} | Ocorreu um erro ao usar esse comando.`
    },
    enus: {
        basePrompts: (userName: string, company: Company, expectations: string, hasEasierSkill: boolean) => {
            const basePrompts = [
                brBuilder(
                    `The user ${userName} is working at their company.`,
                    `Create a realistic challenge based on the following information:`,
                    ``,
                    `Company name: ${company.name}`,
                    `Description: ${company.description}`,
                    `Difficulty: ${company.difficulty} (1 = very easy, 10 = very difficult)`,
                    `Employee expectations: ${expectations}`,
                    ``,
                    `Generate a simulation of a situation that could occur in the daily work routine, according to the difficulty level. The situation should require the user to say how they would react.`,
                    `It's not an interview question.`,
                    ``,
                    `Return only the question, without explanations, without quotes and without additional comments.`
                ),

                brBuilder(
                    `You are ${userName}, employee of the company ${company.name}.`,
                    `Your company is described as: ${company.description}`,
                    `It expects from its employees: ${expectations}`,
                    ``,
                    `Create an unexpected or challenging situation that could happen in this environment.`,
                    `Use the difficulty (${company.difficulty}) to adjust the pressure or complexity level.`,
                    ``,
                    `Describe the situation as if it's happening now and ask the user to say how they would react.`,
                    ``,
                    `Only the question, without explanations, quotes or comments.`
                ),

                brBuilder(
                    `Simulate a work event for ${userName}, employee of the company ${company.name}.`,
                    `Details: ${company.description}`,
                    `Expectations: ${expectations}`,
                    `Difficulty: ${company.difficulty}`,
                    ``,
                    `Create a typical challenge from the professional environment, appropriate to the difficulty.`,
                    `The situation should require a practical decision, not be an interview question.`,
                    ``,
                    `Return only the question, in a direct way.`
                )
            ];

            const easierPrompts = [
                brBuilder(
                    `The user ${userName} is working at the company ${company.name}.`,
                    `Their pet reduced the complexity of today's challenge 🐾`,
                    ``,
                    `Create a simpler, everyday situation related to the described environment:`,
                    `Description: ${company.description}`,
                    `Expectations: ${expectations}`,
                    ``,
                    `The difficulty should be reduced (e.g.: a small unforeseen event or unexpected task, not a complex problem).`,
                    ``,
                    `Ask the user to say how they would react, without additional explanations.`
                ),

                brBuilder(
                    `Simulate a small challenge in ${userName}'s workday at the company ${company.name}.`,
                    `The user's pet is helping to make things easier today 🐾`,
                    ``,
                    `Create a light situation, but still plausible for a professional environment with these characteristics:`,
                    `Description: ${company.description}`,
                    `Expectations: ${expectations}`,
                    ``,
                    `The difficulty should be visibly lower than ${company.difficulty}, focusing on routine tasks or simple problems.`,
                    ``,
                    `Only the final question, direct and clear.`
                )
            ];

            const pool = hasEasierSkill ? easierPrompts : basePrompts;
            return getRandomValue(pool);
        },
        iaIsGenerating: `${icon.denied} | The AI is generating a response for you. Try again later`,
        alreadyAsInASituation: `${icon.denied} | You are participating in a challenge, wait for it to expire or complete it to use this command again.`,
        doNotHaveWork: (commandId: string) => `${icon.Eris_shy} | You don't have a job! Use the command **</jobs search:${commandId}>** to find a job!`,
        cooldown: (cooldown: Date) => `${icon.denied} | You already worked today. Try again ${time(cooldown, "R")}`,
        situationOccured: `${icon.waiting_white} | A new challenge appeared! Please wait a moment.`,
        expectationsFormatted: (expectation: string[] | { level: number, skill: string }[]) => {
            let companyExpectationsFormatted: string;

            if (Array.isArray(expectation)) {
                if (typeof expectation[0] === "string") {
                    companyExpectationsFormatted = expectation.join(", ").replace(/, ([^,]*)$/, " and $1");
                } else {
                    companyExpectationsFormatted = expectation
                        .map((e) =>
                            typeof e === "object" && "skill" in e
                                ? `Skill: ${e.skill}, Level: ${e.level}`
                                : `Unable to format this expectation`
                        )
                        .join(", ");
                }
            } else {
                companyExpectationsFormatted = `The company has no defined expectations.`;
            }

            return companyExpectationsFormatted;
        },
        log: (wage: number) => `Worked and received their salary of: **${wage}**`,
        logApiError: `An error occurred while making a request to the Gemini API`,
        apiErrorMessage: (wage: number) => `${icon.Eris_cry} | An error occurred while generating the challenge, so you received the normal salary of: ${wage}`,
        situation: {
            container: {
                title: brBuilder(
                    `## A new challenge has appeared! ${icon.Eris_enchanted_left}`,
                    "Answer the question below, how would you react to this situation?",
                    "-# ╰ note: if you answer correctly you might even get a raise today!"
                ),
                button: "Answer"
            }
        },
        message: (money: number, xp: number, wage: number) => brBuilder(
            `## You worked and received your salary of: **${wage}** ${icon.Eris_ok_left}`,
            `> You now have: **${money}** styx in your wallet!`,
            `> And have: **${xp}** xp!`,
        ),
        error: `${icon.Eris_cry} | An error occured while executing this command`
    },
    eses: {
        basePrompts: (userName: string, company: Company, expectations: string, hasEasierSkill: boolean) => {
            const basePrompts = [
                brBuilder(
                    `El usuario ${userName} está trabajando en su empresa.`,
                    `Crea un desafío realista basado en la siguiente información:`,
                    ``,
                    `Nombre de la empresa: ${company.name}`,
                    `Descripción: ${company.description}`,
                    `Dificultad: ${company.difficulty} (1 = muy fácil, 10 = muy difícil)`,
                    `Expectativas en los empleados: ${expectations}`,
                    ``,
                    `Genera una simulación de situación que podría ocurrir en el día a día laboral, de acuerdo al nivel de dificultad. La situación debe exigir que el usuario diga cómo reaccionaría.`,
                    `No es una pregunta de entrevista.`,
                    ``,
                    `Retorna solo la pregunta, sin explicaciones, sin comillas y sin comentarios adicionales.`
                ),

                brBuilder(
                    `Eres ${userName}, empleado de la empresa ${company.name}.`,
                    `Tu empresa se describe así: ${company.description}`,
                    `Ella espera de sus empleados: ${expectations}`,
                    ``,
                    `Crea una situación inesperada o desafiante que pueda pasar en este ambiente.`,
                    `Usa la dificultad (${company.difficulty}) para ajustar el nivel de presión o complejidad.`,
                    ``,
                    `Describe la situación como si estuviera pasando ahora y pide que el usuario diga cómo reaccionaría.`,
                    ``,
                    `Solo la pregunta, sin explicaciones, comillas o comentarios.`
                ),

                brBuilder(
                    `Simula un evento laboral para ${userName}, empleado de la empresa ${company.name}.`,
                    `Detalles: ${company.description}`,
                    `Expectativas: ${expectations}`,
                    `Dificultad: ${company.difficulty}`,
                    ``,
                    `Crea un desafío típico del ambiente profesional, adecuado a la dificultad.`,
                    `La situación debe exigir una decisión práctica, no ser una pregunta de entrevista.`,
                    ``,
                    `Retorna solo la pregunta, de forma directa.`
                )
            ];

            const easierPrompts = [
                brBuilder(
                    `El usuario ${userName} está trabajando en la empresa ${company.name}.`,
                    `Su mascota redujo la complejidad del desafío de hoy 🐾`,
                    ``,
                    `Crea una situación más simple, cotidiana, relacionada al ambiente descrito:`,
                    `Descripción: ${company.description}`,
                    `Expectativas: ${expectations}`,
                    ``,
                    `La dificultad debe ser reducida (ej.: un pequeño imprevisto o tarea inesperada, no un problema complejo).`,
                    ``,
                    `Pide que el usuario diga cómo reaccionaría, sin explicaciones adicionales.`
                ),

                brBuilder(
                    `Simula un pequeño desafío en el día de trabajo de ${userName} en la empresa ${company.name}.`,
                    `La mascota del usuario está ayudando a hacer las cosas más fáciles hoy 🐾`,
                    ``,
                    `Crea una situación leve, pero aún plausible para un ambiente profesional con estas características:`,
                    `Descripción: ${company.description}`,
                    `Expectativas: ${expectations}`,
                    ``,
                    `La dificultad debe ser visiblemente menor que ${company.difficulty}, con enfoque en tareas rutinarias o problemas simples.`,
                    ``,
                    `Solo la pregunta final, directa y clara.`
                )
            ];

            const pool = hasEasierSkill ? easierPrompts : basePrompts;
            return getRandomValue(pool);
        },
        iaIsGenerating: `${icon.denied} | La IA está generando una respuesta para ti. Intenta nuevamente más tarde`,
        alreadyAsInASituation: `${icon.denied} | Estás participando en un desafío, espera a que expire o termínalo para poder usar este comando nuevamente.`,
        doNotHaveWork: (commandId: string) => `${icon.Eris_shy} | ¡No tienes un trabajo! Usa el comando **</jobs search:${commandId}>** para encontrar un trabajo!`,
        cooldown: (cooldown: Date) => `${icon.denied} | Ya trabajaste hoy. Intenta nuevamente ${time(cooldown, "R")}`,
        situationOccured: `${icon.waiting_white} | ¡Un nuevo desafío apareció! Por favor espera un instante.`,
        expectationsFormatted: (expectation: string[] | { level: number, skill: string }[]) => {
            let companyExpectationsFormatted: string;

            if (Array.isArray(expectation)) {
                if (typeof expectation[0] === "string") {
                    companyExpectationsFormatted = expectation.join(", ").replace(/, ([^,]*)$/, " y $1");
                } else {
                    companyExpectationsFormatted = expectation
                        .map((e) =>
                            typeof e === "object" && "skill" in e
                                ? `Habilidad: ${e.skill}, Nivel: ${e.level}`
                                : `No fue posible formatear esta expectativa`
                        )
                        .join(", ");
                }
            } else {
                companyExpectationsFormatted = `La empresa no tiene expectativas definidas.`;
            }

            return companyExpectationsFormatted;
        },
        log: (wage: number) => `Trabajó y recibió su salario de: **${wage}**`,
        logApiError: `Ocurrió un error al hacer la solicitud a la API de Gemini`,
        apiErrorMessage: (wage: number) => `${icon.Eris_cry} | Ocurrió un error al generar el desafío, por eso recibiste el salario normal de: ${wage}`,
        situation: {
            container: {
                title: brBuilder(
                    `## ¡Un nuevo desafío ha aparecido! ${icon.Eris_enchanted_left}`,
                    "Responde la pregunta de abajo, ¿cómo reaccionarías a esta situación?",
                    "-# ╰ nota: ¡si respondes correctamente podrías incluso obtener un aumento hoy!"
                ),
                button: "Responder"
            }
        },
        message: (money: number, xp: number, wage: number) => brBuilder(
            `## Trabajaste y recibiste tu salario de: **${wage}** ${icon.Eris_ok_left}`,
            `> Ahora tienes: **${money}** styx en tu cartera!`,
            `> ¡Y tienes: **${xp}** xp!`,
        ),
        error: `${icon.Eris_cry} | Ocorreu um erro ao usar esse comando.`
    }
}