import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

BigInt.prototype.toJSON = function () { return this.toString(); };

export default async function info(app: FastifyInstance, client: Client<true>) {
    app.get<{ Params: { userId: string }, Querystring: { include?: string } }>("/:userId/info", async (req, reply) => {
        if (
            !req.application ||
            (!req.application.data.permissions.includes("ALL") && !req.application.data.permissions.includes("USER.INFO.READ"))
        ) {
            return reply.status(StatusCodes.FORBIDDEN).send({
                message: "You do not have permission to see the info from a user",
                success: false,
            });
        }

        const { userId } = req.params;
        const discordUser = await client.users.fetch(userId, { cache: true }).catch(() => null);
        if (!discordUser) return reply.status(StatusCodes.NOT_FOUND).send({ message: "User not found" });
        if (discordUser.bot)
            return reply.status(StatusCodes.FORBIDDEN).send({ message: "You cannot see the info from a bot", success: false });


        const query = req.query.include;

        if (query) {
            // 1. Normaliza: aceita + e espaço como separadores
            const queryIncludes = (query || "")
                .split("+")
                .flatMap(part => part.split(" "))
                .map(s => s.trim())
                .filter(Boolean);

            // 2. Lista de includes válidos (agora com sub-sub-includes)
            const availableIncludes: Record<string, string[] | Record<string, string[]>> = {
                pets: ["genetics", "skills", "personality", "pet"],
                activePet: ["genetics", "skills", "personality", "pet"],
                bets: {
                    match: ["homeTeam", "awayTeam"]  // ← AQUI ESTÁ O SEGREDO
                },
                giveaways: ["giveaway"],
                stocks: [],
                fishs: ["fish"],
                fishingRods: ["fishingRod"],  // ← corrigi o nome (plural!)
                cooldowns: [],
                company: []
            };

            // 4. Monta o include final — VERSÃO CORRETA E SIMPLES
            const prismaInclude: any = {};

            // Primeiro, processa todos os includes normais (1 nível)
            queryIncludes.forEach(inc => {
                const parts = inc.split(".");
                const primary = parts[0];

                if (!(primary in availableIncludes)) return;

                const config = availableIncludes[primary];

                // Caso simples: pets.skills, company, etc.
                if (Array.isArray(config)) {
                    if (parts.length === 1) {
                        prismaInclude[primary] = true;
                    } else if (parts.length === 2) {
                        const sub = parts[1];
                        if (config.includes(sub)) {
                            if (!prismaInclude[primary]) prismaInclude[primary] = { include: {} };
                            prismaInclude[primary].include[sub] = true;
                        }
                    }
                }

                // Caso bets.match.homeTeam
                if (primary === "bets" && parts.length >= 2) {
                    if (!prismaInclude.bets) prismaInclude.bets = { include: { match: { include: {} } } };

                    if (parts[1] === "match") {
                        if (parts.length === 2) {
                            // bets.match
                            prismaInclude.bets.include.match = { include: {} };
                        } else if (parts.length === 3) {
                            // bets.match.homeTeam ou awayTeam
                            const sub = parts[2];
                            if (sub === "homeTeam" || sub === "awayTeam") {
                                prismaInclude.bets.include.match.include[sub] = true;
                            }
                        }
                    }
                }
            });

            // FIX FINAL: garante que match tenha include de relações
            if (prismaInclude.bets?.include?.match) {
                if (prismaInclude.bets.include.match === true) {
                    prismaInclude.bets.include.match = { include: { homeTeam: true, awayTeam: true } };
                } else if (prismaInclude.bets.include.match.include) {
                    prismaInclude.bets.include.match.include.homeTeam = true;
                    prismaInclude.bets.include.match.include.awayTeam = true;
                }
            }

            const user = await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: { id: userId },
                include: prismaInclude
            });

            return reply.status(StatusCodes.OK).send({
                ...user,
                discord: discordUser,
                token: undefined,
            });
        } else {
            const user = await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: { id: userId },
            });

            return reply.status(StatusCodes.OK).send({
                ...user,
                discord: discordUser,
                token: undefined,
            });
        }
    });
}