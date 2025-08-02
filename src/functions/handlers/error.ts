import { DiscordAPIError } from "discord.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

export function serverErrorHandler(error: any, _req: FastifyRequest, reply: FastifyReply) {
    if (error instanceof ZodError) {
        return reply.status(StatusCodes.BAD_REQUEST).send({
            message: "Invalid information",
            errors: error.issues.map(err => ({
                path: err.path.join("."),
                message: err.message,
            }))
        });
    }

    if (error instanceof DiscordAPIError) {
        return reply.status(error.status).send({
            message: error.message
        })
    }

    return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
}