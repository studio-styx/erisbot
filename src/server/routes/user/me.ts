import { prisma } from "#database";
import { jwtReservedToken } from "#functions";
import { Client, PermissionsBitField } from "discord.js";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
interface MeQuery {
    q?: string;
    get?: string;
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
                "stocks",
            ]);

            const includeObj: Record<string, boolean> = {};

            if (req.query.q) {
                const includes = String(req.query.q).split(/[\s+]+/).filter(Boolean);

                includes.forEach(include => {
                    if (validIncludes.has(include)) {
                        includeObj[include] = true;
                    }
                });
            }

            const userPrisma = await prisma.user.findUnique({
                where: { id: userId },
                include: includeObj
            });

            if (!userPrisma) {
                return reply.status(404).send({ error: "User not found" });
            }

            const gets = req.query.get?.split(/[\s+]+/).filter(Boolean) || [];

            const discordUser = await client.users.fetch(userId);
            
            // Obter apenas se guilds foi solicitado
            let guildInfo = null;
            
            if (gets.includes("guilds")) {
                // Pegar todas as guildas do bot
                const botGuilds = client.guilds.cache;
                
                // Verificar em quais guildas o usuário está
                const userGuilds = [];
                
                for (const [_guildId, guild] of botGuilds) {
                    try {
                        // Verifica se o usuário está na guilda
                        const member = await guild.members.fetch(userId);
                        
                        // Verifica se tem permissão de gerenciar (0x20 = MANAGE_GUILD)
                        const hasManage = member.permissions.has(PermissionsBitField.Flags.ManageGuild);
                        
                        userGuilds.push({
                            id: guild.id,
                            name: guild.name,
                            icon: guild.iconURL(),
                            hasManage,
                            isMutual: true 
                        });
                    } catch (error) {
                        // Usuário não está na guilda, ignorar
                        continue;
                    }
                }
                
                guildInfo = {
                    allGuilds: userGuilds,
                    managedGuilds: userGuilds.filter(g => g.hasManage),
                    mutualGuilds: userGuilds,
                    managedAndMutualGuilds: userGuilds.filter(g => g.hasManage)
                };
            }

            return reply.send({
                db: userPrisma,
                discord: discordUser,
                authorized: null,
                ...guildInfo
            });

        } catch (err) {
            console.error(err);
            return reply.status(401).send({ error: "Invalid token" });
        }
    });
}
