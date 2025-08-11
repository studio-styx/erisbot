import { API } from "#functions";
import { Client, OAuth2Scopes } from "discord.js";
import { FastifyInstance } from "fastify";

export default async function botAuthRoute(app: FastifyInstance, _client: Client<true>) {
    app.get("/authorization", async (_req, reply) => {
        const authorizationUrl = API.discord.users.createAuthorizationURL(
            OAuth2Scopes.Identify,
            OAuth2Scopes.Email,
            OAuth2Scopes.Guilds
        );

        return reply.status(200).send(authorizationUrl);
    })
}