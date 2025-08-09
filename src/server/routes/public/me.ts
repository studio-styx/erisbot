import { prisma } from "#database";
import { API, jwtReservedToken } from "#functions";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { getAccessToken } from "#functions";
import jwt from "jsonwebtoken";

interface MeQuery {
    q?: string;
}

export default async function meRoute(app: FastifyInstance, client: Client<true>) {
    app.get<{ Querystring: MeQuery }>("/me", async (req, reply) => {
        const token = req.cookies.auth;
        if (!token) return reply.status(401).send({ error: "Not logged in" });

        try {
            const secret = process.env.JWT_SECRET || (typeof jwtReservedToken === "function" ? jwtReservedToken : jwtReservedToken);
            const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
            const userId = decoded.sub;

            if (typeof userId !== "string") {
                return reply.status(401).send({ error: "Invalid token" });
            }

            // Lista de includes válidos na sua model User (ajuste conforme seu schema)
            const validIncludes = new Set([
                "cooldowns",
                "company",
                "applications",
                "logs",
                "mails",
                "sendedMails",
                "stocks"
            ]);

            // Monta o objeto include com base no q (se existir)
            let includeObj = {};
            if (req.query.q) {
                const includes = req.query.q.split("+").map(s => s.trim()).filter(Boolean);
                includes.forEach(include => {
                    if (validIncludes.has(include)) {
                        includeObj = { ...includeObj, [include]: true };
                    }
                });
            }

            const userPrisma = await prisma.user.findUnique({
                where: { id: userId },
                include: includeObj,
            });

            if (!userPrisma) {
                return reply.status(404).send({ error: "User not found" });
            }

            const discordUser = await client.users.fetch(userId);
            const acessToken = await getAccessToken(discordUser.id);
            const authorizedUser = await API.discord.users.fetchInfo(acessToken || '');

            return reply.send({ db: userPrisma, discord: discordUser, authorized: authorizedUser.success ? authorizedUser.data : null });
        } catch (err) {
            return reply.status(401).send({ error: "Invalid token" });
        }
    });
}
