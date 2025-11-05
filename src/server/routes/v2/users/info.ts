import { prisma } from "#database";
import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

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
            const queryIncludes = query
                .split("+")
                .flatMap(part => part.split(" "))
                .map(s => s.trim())
                .filter(Boolean);

            const availableIncludes: Record<string, string[]> = {
                pets: ["genetics", "skills", "personality"],
                activePet: ["genetics", "skills", "personality"],
                bets: ["match"],
                giveaways: ["giveaway"],
                stocks: [],
                fishs: ["fish"],
                fishingRod: ["fishingRod"],
                cooldowns: []
            };

            // 2. Parseia cada include
            const parsed = queryIncludes.map(inc => {
                const parts = inc.split(".");
                const primary = parts[0];
                const subs = parts.slice(1);
                return { primary, subs };
            });

            // 3. Agrupa subs por primary
            const grouped = parsed.reduce((acc, { primary, subs }) => {
                if (!acc[primary]) acc[primary] = [];
                acc[primary].push(...subs);
                return acc;
            }, {} as Record<string, string[]>);

            // 4. Monta include
            const prismaInclude = Object.entries(grouped).reduce((acc, [primary, subs]) => {
                if (!(primary in availableIncludes)) return acc;

                const validSubs = subs
                    .map(s => s.trim())
                    .filter(s => availableIncludes[primary].includes(s));

                if (validSubs.length === 0) {
                    acc[primary] = true;
                } else {
                    if (!acc[primary]) {
                        acc[primary] = { include: {} };
                    }
                    validSubs.forEach(key => {
                        (acc[primary] as any).include[key] = true;
                    });
                }
                return acc;
            }, {} as Record<string, any>);

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
                include: {
                    pets: {
                        include: {
                            pet: true
                        }
                    }
                }
            });

            return reply.status(StatusCodes.OK).send({
                ...user,
                discord: discordUser,
                token: undefined,
            });
        }
    });
}