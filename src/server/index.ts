import { createEvent } from "#base";
import { env, logger } from "#settings";
import cors from "@fastify/cors";
import ck from "chalk";
import fastify from "fastify";
import crypto from "node:crypto";
import { jwtReservedToken, serverErrorHandler } from "#functions";
import { prisma } from "#database";
import { StatusCodes } from "http-status-codes";
import fastifyAutoload from "@fastify/autoload";
import path from "node:path";
import cookie from "@fastify/cookie";
import jwt from "jsonwebtoken"

export const reservedToken = crypto.randomBytes(16).toString("hex")

createEvent({
    name: "Start Fastify Server",
    event: "ready", once: true,
    async run(client) {
        const app = fastify();

        // CORS e tratamento de erros
        app.register(cors, { origin: "*" });
        app.register(fastifyAutoload, {
            dir: path.join(import.meta.dirname, "routes"),
            routeParams: true,
            options: client
        })
        app.setErrorHandler(serverErrorHandler);

        // Adiciona tipagem customizada (opcional)
        app.decorateRequest("application", null);

        app.register(cookie, {
            secret: process.env.COOKIE_SECRET || reservedToken,
            parseOptions: {}
        });

        // Middleware de autenticação
        app.addHook("onRequest", async (req, res) => {
            if (req.url.startsWith("/auth")) return;
            if (req.url.startsWith("/public")) {
                const token = req.cookies.auth;
                if (!token) return res.status(StatusCodes.UNAUTHORIZED).send({ error: "Not logged in" });
                const secret = process.env.JWT_SECRET || (typeof jwtReservedToken === "function" ? jwtReservedToken : jwtReservedToken);
                const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
                const userId = decoded.sub;

                if (!userId) {
                    return res.status(StatusCodes.UNAUTHORIZED).send({ error: "Invalid token" });
                }

                req.userId = userId;
                return;
            }
            const token = req.headers.authorization;

            if (!token) {
                return res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
            }

            const hash256 = crypto.createHash("sha256").update(token).digest("hex");

            const application = await prisma.application.findUnique({
                where: { token: hash256 }
            });

            if (!application) {
                return res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
            }

            // Armazena no request para ser usado nas rotas
            req.application = { data: application, tokenHash: hash256 };

            // roda em paralelo
            prisma.requisition.create({
                data: {
                    applicationId: application.id,
                    url: req.url,
                }
            })
        });

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