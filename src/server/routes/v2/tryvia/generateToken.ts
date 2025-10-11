import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import crypto from "crypto"
import { redis } from "#database";
import { StatusCodes } from "http-status-codes";

export default async function getQuestions(app: FastifyInstance, _client: Client<true>) {
    app.get("/generateToken", async (_req, reply) => {
        const token = crypto.randomBytes(16).toString("hex");
        await redis.setex(`api:tryvia:sessionToken:${token}`, 60 * 60 * 6, "[]");

        return reply.status(StatusCodes.CREATED).send({
            token
        })
    })
}