import { asPrisma, dzonePrisma } from "#database";
import { getJwtToken } from "#functions";
import { settings } from "#settings";
import { createContainer, createSeparator, brBuilder, createSection, createEmbed } from "@magicyan/discord";
import { Client, roleMention, userMention } from "discord.js";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export default function addBotRoute(app: FastifyInstance, client: Client<true>) {
    app.post<{ Params: { server: string } }>("/addBot/:server", async (req, reply) => {
        const server = req.params.server;

        if (!server || (server !== "eris" && server !== "devzone")) return reply.status(StatusCodes.BAD_REQUEST).send({ error: "Invalid server" });

        const addBotSchemaBody = z.object({
            applicationId: z.string().min(1),
            language: z.enum(["Javascript", "Typescript", "Java", "Kotlin", "BDFD", "Golang", "Rust", "Ruby", "Python"]),
            lib: z.string().min(1),
            description: z.string().min(50).max(300),
            carefulAnalysis: z.boolean().optional(),
            prefix: z.string().min(1).max(4).optional(),
            hasSlashCommand: z.boolean().optional(),
            website: z.string().url().optional(),
            github: z.string().url().optional(),
            supportServerLink: z.string().url().optional()
        }).refine(
            (data) => data.prefix !== undefined || data.hasSlashCommand !== undefined,
            {
                message: "Either 'prefix' or 'hasSlashCommand' must be provided",
                path: ["prefix"]
            } 
        );
        const body = addBotSchemaBody.parse(req.body);

        const token = req.cookies.auth;
        if (!token) return reply.status(StatusCodes.UNAUTHORIZED).send({ error: "Not logged in" });
        const userId = getJwtToken(token);
        if (!userId) return reply.status(StatusCodes.UNAUTHORIZED).send({ error: "Invalid token" });

        if (typeof userId !== "string") {
            return reply.status(401).send({ error: "Invalid token" });
        }
        const user = server === "eris" ? await asPrisma.user.upsert({
            where: { id: userId },
            create: { id: userId },
            update: {},
            include: {
                applications: {
                    include: { analyze: true }
                }
            }
        }) : await dzonePrisma.user.upsert({
            where: { id: userId },
            create: { id: userId },
            update: {},
            include: {
                applications: {
                    include: { analyze: true }
                }
            }
        });

        const applicationExists = user.applications.some(app => app.id === body.applicationId);
        if (applicationExists) {
            return reply.status(StatusCodes.CONFLICT).send({
                error: "This application has already been added to your account"
            });
        }

        const hasUnfinishedAnalysis = user.applications.some(app =>
            app.analyze && app.analyze.finishedIn === null
        );

        if (hasUnfinishedAnalysis) {
            return reply.status(StatusCodes.CONFLICT).send({
                error: "You already have an application being analyzed. Please wait until it's finished before adding a new one."
            });
        }
        const discordApp = await client.users.fetch(body.applicationId).catch(() => null);
        if (!discordApp) return reply.status(StatusCodes.NOT_FOUND).send({ error: "Application not found" });
        if (!discordApp.bot) return reply.status(StatusCodes.BAD_REQUEST).send({ error: "Application is not a bot" });
        
        const guild = server === "eris" ? client.guilds.cache.get("1395383469210865694") : client.guilds.cache.get("1338980027529957396");
        const channel = server === "eris" ? await guild?.channels.fetch("1397265273823821904") : await guild?.channels.fetch("1358187737810866307");
        if (!channel) return reply.status(StatusCodes.NOT_FOUND).send({ error: "Channel to send solicitation message not found" });
        
        const discordUser = await client.users.fetch(userId).catch(() => null);
        if (!discordUser) return reply.status(StatusCodes.NOT_FOUND).send({ error: "User not found" });
        
        const mailChannel = server === "eris" ? await client.channels.fetch("1395418436602957824") : await client.channels.fetch("1339061450206871654");
        if (!mailChannel) return reply.status(StatusCodes.NOT_FOUND).send({ error: "Mail channel not found" });

        const application = server === "eris" ? await asPrisma.application.create({
            data: {
                id: body.applicationId,
                userId: userId,
                language: body.language,
                lib: body.lib,
                description: body.description,
                prefix: body.prefix,
                hasSlashCommands: body.hasSlashCommand,
                website: body.website,
                github: body.github,
                carefulAnalysis: body.carefulAnalysis || false,
                supportServerLink: body.supportServerLink,
                name: discordApp.username,
            }
        }) : await dzonePrisma.application.create({
            data: {
                id: body.applicationId,
                userId: userId,
                language: body.language,
                lib: body.lib,
                description: body.description,
                prefix: body.prefix,
                hasSlashCommands: body.hasSlashCommand,
                website: body.website,
                github: body.github,
                supportServerLink: body.supportServerLink,
                name: discordApp.username,
            }
        });

        const container = createContainer({
            accentColor: settings.colors.success,
            components: [
                roleMention(server === "devzone" ? "1374888824777474098" : body.carefulAnalysis ? "1397566463014998116" : "1395420237184372806"),
                createSeparator(),
                `### Nova aplicação`,
                brBuilder(
                    `**Dono do bot:** <@${userId}>`,
                    `**ID:** \`${userId}\``,
                    `**Prefixo:** \`${body.prefix}\``,
                    `**Comandos em slash:** ${body.hasSlashCommand ? "Sim" : "Não"}`,
                    `**Linguagem:** \`${body.language}\``,
                    `**Biblioteca:** \`${body.lib}\``,
                    `**Descrição:** \`${body.description || "nenhuma descrição fornecida"}\``,
                    `**Analise cuidadosa:** \`${body.carefulAnalysis ? "Sim" : "Não"}\``,
                    ``
                ),
                createSeparator(),
                `### Informações que eu encontrei sobre a aplicação:`,
                createSection({
                    content: brBuilder(
                        `**Nome:** \`${discordApp?.username || "Não encontrado"}\``,
                        `**Tag:** \`${discordApp?.tag || "Não encontrado"}\``,
                        `**ID:** \`${discordApp?.id || "Não encontrado"}\``,
                        `**Criado em:** ${discordApp?.createdTimestamp ? `<t:${Math.floor(discordApp?.createdTimestamp! / 1000)}:F>` : '`Não encontrado`'}`,
                        `**Avatar:** ${discordApp?.avatarURL() ? `[Aperte aqui para ver](${discordApp?.avatarURL()})` : '`Não encontrado`'}`,
                    ),
                    thumbnail: discordApp?.avatarURL() || discordUser.displayAvatarURL(),
                })
            ]
        })

        if ("send" in channel) channel.send({ components: [container], flags: ["IsComponentsV2"] });


        const mailEmbed = createEmbed({
            title: "Nova aplicação",
            description: brBuilder(
                `Nova aplicação enviada por <@${discordUser.id}>`,
                `**Nome:** \`${discordApp?.displayName || "Não encontrado"}\``,
                server === "eris" && `**Analise cuidadosa?** \`${body.carefulAnalysis ? "Sim" : "Não"}\``,
                `Agora ele espera a analise!`
            ),
            thumbnail: discordApp?.displayAvatarURL() || discordApp.avatarURL(),
            timestamp: new Date().toISOString(),
            color: settings.colors.success,
        })

        if ("send" in mailChannel) {
            mailChannel.send({
                content: userMention(discordUser.id),
                embeds: [mailEmbed]
            })    
        }

        return reply.status(StatusCodes.CREATED).send({ application, message: "Application added" });
    });
}