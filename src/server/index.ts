import { createEvent } from "#base";
import { env, logger } from "#settings";
import cors from "@fastify/cors";
import ck from "chalk";
import fastify from "fastify";
import crypto from "node:crypto";
import { registerRoutes } from "./routes/index.js";
import { serverErrorHandler } from "#functions";
import { prisma } from "#database";
import { StatusCodes } from "http-status-codes";

createEvent({
    name: "Start Fastify Server",
    event: "ready", once: true,
    async run(client) {
        const app = fastify();

        // CORS e tratamento de erros
        app.register(cors, { origin: "*" });
        app.setErrorHandler(serverErrorHandler);

        // Adiciona tipagem customizada (opcional)
        app.decorateRequest("application", null);

        // Middleware de autenticação
        app.addHook("onRequest", async (req, res) => {
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
        });

        // Registra rotas com acesso ao `req.application`
        registerRoutes(app, client);

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
