import { API, generateJWT } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { setAuth } from "functions/api/auth.js";

interface RouteGeneric {
    Querystring: {
        code: string
    }
}

export default async function authRoutes(app: FastifyInstance, _client: Client<true>) {
    app.get<RouteGeneric>("/redirect", async (req, reply) => {
        const { code } = req.query;

        const tokenResult = await API.discord.users.tokenExchange(code);
        if (!tokenResult.success) {
            return reply.status(tokenResult.status).send(tokenResult.error)
        }

        const tokenData = tokenResult.data;

        const userResult = await API.discord.users.fetchInfo(tokenData.access_token);
        if (!userResult.success) {
            return reply.status(userResult.status).send(userResult.error)
        }

        const user = userResult.data;

        await setAuth(user.id, tokenData)

        const jwtToken = generateJWT(user.id);

        const redirect = process.env.ENV === "dev" 
            ? "http://localhost:5173/" 
            : "https://erisbot.squareweb.app/";

        // Define o cookie e redireciona
        return reply
            .setCookie("auth", jwtToken, {
                httpOnly: true,
                secure: process.env.ENV !== "dev", // só segura em produção
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 // 1 hora
            })
            .redirect(redirect);

    })
}