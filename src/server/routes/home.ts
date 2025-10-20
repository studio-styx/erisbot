import { settings } from "#settings";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default function homeRoute(app: FastifyInstance, client: Client<true>){
    app.get("/", (_, res) => {
        return res.status(StatusCodes.OK).send({
            message: `🍃 Online on discord as ${client.user.username}`,
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            version: settings.bot.version,
            sdk: settings.sdk
        });
    });
}