import { createEvent } from "#base";
import { env, logger } from "#settings";
import cors from "@fastify/cors";
import ck from "chalk";
import fastify from "fastify";
import crypto from "node:crypto";
import { jwtReservedToken, serverErrorHandler } from "#functions";
import { prisma, redis } from "#database";
import { StatusCodes } from "http-status-codes";
import fastifyAutoload from "@fastify/autoload";
import path from "node:path";
import cookie from "@fastify/cookie";
import jwt from "jsonwebtoken"
import fastifyFormbody from '@fastify/formbody';

export const reservedToken = crypto.randomBytes(16).toString("hex")

createEvent({
    name: "Start Fastify Server",
    event: "clientReady", once: true,
    async run(client) {
        const app = fastify();

        app.register(fastifyFormbody);
        // CORS e tratamento de erros
        app.register(cors, {
            origin: (origin, cb) => {
                // origin === undefined => requisição curl/postman (não-browser) — permitir
                if (!origin) return cb(null, true);
                if (origin === "https://erisbot.squareweb.app" || origin === "http://localhost:5173") {
                    // permite a origin confiável (vai setar Access-Control-Allow-Origin para o origin)
                    return cb(null, true);
                }
                // caso contrário, negar aqui (permitiremos '*' apenas nas rotas públicas explicitamente)
                return cb(null, false);
            },
            credentials: true
        });
        app.register(fastifyAutoload, {
            dir: path.join(import.meta.dirname, "routes"),
            routeParams: true,
            options: client
        })

        app.setErrorHandler(serverErrorHandler);

        app.decorateRequest("application", null);

        app.register(cookie, {
            secret: process.env.COOKIE_SECRET || reservedToken,
            parseOptions: {}
        });

        await app.register(import('@fastify/rate-limit'), {
            max: 20,
            timeWindow: '30s',
        });


        // Middleware de autenticação
        app.addHook('onRequest', async (req, res) => {
            console.log('Request:', req.url, 'method:', req.method);

            if (req.url.startsWith('/topgg')) return;
            if (req.url === "/") return;
            if (req.url.startsWith('/auth')) return;

            if (req.url.startsWith('/user') || req.url.startsWith('/guilds') || req.url.startsWith('/botlist') || req.url.startsWith('/bot')) {
                const token = req.cookies.auth;
                if (!token) return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'Not logged in' });
                const secret = process.env.JWT_SECRET || (typeof jwtReservedToken === 'function' ? jwtReservedToken : jwtReservedToken);
                const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
                const userId = decoded.sub;

                if (!userId) {
                    return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'Invalid token' });
                }

                req.userId = userId;
                return;
            }

            if (req.url.startsWith('/web')) {
                const secret = process.env.FRONT_SECRET;
                const token = req.headers.token as string | undefined;

                if (!token) return res.status(StatusCodes.UNAUTHORIZED).send();
                if (token !== secret) return res.status(StatusCodes.UNAUTHORIZED).send();
                return;
            }

            if (req.url.startsWith('/v1/tryvia')) {
                const reqIp = req.ip
                const token = req.headers.authorization
                const now = Date.now(); // Timestamp em ms

                // Chaves Redis
                const lastRequestKey = `rate:ip:${reqIp}:last_request`;
                const timestampsKey = `pattern:ip:${reqIp}:timestamps`;
                const blockKey = `block:ip:${reqIp}`;

                // Verificar se está bloqueado
                const [hasValidToken, isBlocked] = await Promise.all([
                    await validateToken(token),
                    await redis.exists(blockKey),
                ])

                // Definir limites
                const rateLimitWindow = hasValidToken ? 4_000 : 20_000;
                const patternHistoryLimit = 20;
                const varianceThreshold = 1000;

                if (isBlocked) {
                    const ttl = await redis.ttl(blockKey);
                    return res.status(StatusCodes.FORBIDDEN).send({
                        error: 'IP temporarily blocked',
                        retryAfter: ttl,
                    });
                }

                // Verificar rate limit simples
                const lastRequest = await redis.get(lastRequestKey);
                if (lastRequest) {
                    const timeSinceLast = now - parseInt(lastRequest, 10);
                    if (timeSinceLast < rateLimitWindow) {
                        return res.status(StatusCodes.TOO_MANY_REQUESTS).send({
                            error: 'Rate limit exceeded',
                            retryAfter: Math.ceil((rateLimitWindow - timeSinceLast) / 1000),
                        });
                    }
                }

                // Carregar timestamps para detecção de padrões
                const timestamps = await redis.lrange(timestampsKey, 0, -1);
                const parsedTimestamps: number[] = timestamps.map(ts => parseInt(ts, 10));

                if (parsedTimestamps.length >= 3) {
                    const intervals: number[] = [];
                    for (let i = 1; i < parsedTimestamps.length; i++) {
                        intervals.push(parsedTimestamps[i] - parsedTimestamps[i - 1]);
                    }

                    // Calcular média e variância (desvio padrão ao quadrado)
                    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
                    const variance = intervals.reduce((sum, val) => sum + (val - mean) ** 2, 0) / intervals.length;

                    if (variance < varianceThreshold) {
                        // Padrão detectado: intervalos muito regulares
                        await redis.set(blockKey, 'blocked', 'EX', 3600); // Bloqueia por 1 hora (3600s)
                        return res.status(StatusCodes.FORBIDDEN).send({
                            error: 'Suspicious request pattern detected',
                            retryAfter: 3600,
                        });
                    }
                }

                await Promise.all([
                    redis.set(lastRequestKey, now.toString()),
                    redis.lpush(timestampsKey, now.toString()),
                    redis.ltrim(timestampsKey, 0, patternHistoryLimit - 1),
                ])

                if (hasValidToken) {
                    const hash256 = crypto.createHash('sha256').update(token ?? "").digest('hex');
                    const application = await prisma.application.findUnique({
                        where: { token: hash256 },
                    });
                    if (application) {
                        await prisma.requisition.create({
                            data: {
                                applicationId: application.id,
                                url: req.url,
                            },
                        }).catch(e => {
                            logger.error('Erro ao salvar requisition:', e);
                        });
                    }
                }
                return;
            }

            const token = req.headers.authorization as string | undefined;

            if (!token) {
                return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Unauthorized' });
            }

            const hash256 = crypto.createHash('sha256').update(token).digest('hex');
            const application = await prisma.application.findUnique({
                where: { token: hash256 },
            });

            if (!application) {
                return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Unauthorized' });
            }

            req.application = { data: application, tokenHash: hash256 };
        });

        app.addHook('onSend', async (request, _reply, payload) => {
            const application = request.application?.data;
            if (!application) return payload;

            try {
                await prisma.requisition.create({
                    data: {
                        applicationId: application.id,
                        url: request.url,
                    },
                });
            } catch (error) {
                logger.error('Erro ao salvar requisition:', error);
                // Não lance o erro para não afetar a resposta ao cliente
            }

            return payload; 
        });

        // Função para validar o token
        async function validateToken(token: string | undefined): Promise<boolean> {
            if (!token) return false;
            const hash256 = crypto.createHash('sha256').update(token).digest('hex');
            const application = await prisma.application.findUnique({
                where: { token: hash256 },
            });
            return !!application;
        }

        // Inicia o servidor
        const port = env.SERVER_PORT ?? 3000;
        await app.listen({ port, host: "0.0.0.0" })
            .then(() => {
                logger.log(ck.green(`● ${ck.underline("Fastify")} server listening on port ${port}`));
            })
            .catch(err => {
                logger.error(err);
                process.exit(1);
            });
    },
});