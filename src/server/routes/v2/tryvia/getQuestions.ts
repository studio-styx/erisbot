import { prisma, redis } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

interface RouteGeneric {
    Querystring: {
        sessionToken?: string;
        tags?: string;
        difficulty?: string;
        amount?: string;
        types?: string;
    }
}


export default async function getQuestions(app: FastifyInstance, _client: Client<true>) {
    app.get<RouteGeneric>("/questions", async (req, reply) => {
        const questionsQuerySchema = z.object({
            sessionToken: z.string().optional(),
            tags: z.array(z.string()).optional(),
            difficulty: z.enum(["easy", "medium", "hard"]).optional(),
            amount: z.coerce.number().min(1).max(30).default(10),
            type: z.enum(["multiple", "boolean", "writeinchat"]).optional()
        });

        const { sessionToken, tags, difficulty, amount, type } = questionsQuerySchema.parse({
            ...req.query,
            tags: req.query.tags ? req.query.tags.split("+") : undefined
        });

        const warnings = [];

        let sessionTokenData: null | number[] = null
        if (sessionToken) {
            const raw = await redis.get(`api:tryvia:sessionToken:${sessionToken}`);
            if (!raw) {
                warnings.push(`Access token is expired or not exist`)
            } else {
                sessionTokenData = JSON.parse(raw) as number[];
            }
        }

        const prismaDifficulty = difficulty ? difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD" : undefined;
        const prismaType = type ? type.toUpperCase() as "MULTIPLE" | "BOOLEAN" | "WRITEINCHAT" : undefined;

        const questions = await prisma.tryviaQuestions.findMany({
            where: {
                tags: tags ? {
                    hasEvery: tags
                } : undefined,
                difficulty: prismaDifficulty,
                type: prismaType,
                id: sessionTokenData ? {
                    notIn: sessionTokenData
                } : undefined
            },
            take: amount,
            orderBy: {
                id: 'desc'
            }
        });

        if (questions.length < 1) {
            if (sessionTokenData && sessionTokenData.length > 3000) {
                const totalQuestions = await prisma.tryviaQuestions.count();
                if (sessionTokenData.length >= totalQuestions) return reply.status(StatusCodes.NO_CONTENT).send({
                    error: "Your sessionToken has all the questions stored in the database."
                })
            }
            return reply.status(StatusCodes.NOT_FOUND).send({
                error: "There are no questions based on these criteria, or your sessionToken has already stored all questions based on this criterion."
            })
        }

        function shuffleArray<T>(array: T[]): T[] {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        const shuffledQuestions = shuffleArray(questions);

        if (shuffledQuestions.length < amount) warnings.push(`It was not possible to obtain all ${amount} questions based on the provided criteria, found: ${shuffledQuestions.length}`);
        if (sessionTokenData) {
            sessionTokenData.push(...shuffledQuestions.map(q => q.id));
            await redis.set(
                `api:tryvia:sessionToken:${sessionToken}`, 
                JSON.stringify(sessionTokenData),
                'KEEPTTL'
            );
        };

        return reply.status(StatusCodes.OK).send({
            warnings: warnings.length > 0 ? warnings : undefined,
            questions: shuffledQuestions,
        });
    })
}