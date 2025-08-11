import { Client } from "discord.js";
import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "#database";
import { getJwtToken, setServerSettings } from "#functions";

export default async function getGuildRoute(app: FastifyInstance, client: Client<true>) {
    app.put<{ Params: { guildId: string } }>("/:guildId", async (req, reply) => {
        const { guildId } = req.params;

        const guild = client.guilds.cache.get(guildId);

        if (!guild) return reply.status(404).send({ error: "Guild not found" })

        const settingsBodySchema = z.object({
            chatBotChannels: z.array(z.string()),
            chatBotEnabled: z.boolean(),
            channelsCommandDisabled: z.array(z.string()),
            channelsCommandDisabledIsHabilited: z.boolean(),
            channelsCommandEnabled: z.array(z.string()),
            channelsCommandEnabledIsHabilited: z.boolean(),
            xpSystemEnabled: z.boolean(),
            difficulty: z.number().min(0.1).max(10),
            rolesXpBonus: z.array(
                z.object({
                    bonus: z.number(),
                    id: z.string()
                }),
            ),
            rolesNotWinXp: z.array(z.string()),
            channelsXpBonus: z.array(
                z.object({
                    bonus: z.number(),
                    id: z.string()
                }),
            ),
            channelsNotWinXp: z.array(z.string()),
            levelGrant: z.array(
                z.object({
                    xp: z.number().min(1),
                    grant: z.enum(["channel", "role"]),
                    id: z.string()
                })
            ),
            warnLevelUp: z.object({
                channel: z.string(),
                enabled: z.boolean(),
                message: z.object({
                    content: z.string().optional(),
                    embed: z.object({
                        title: z.string().optional(),
                        description: z.string().optional(),
                        color: z.number().optional(),
                        thumbnail: z.string().optional(),
                        footer: z.object({
                            text: z.string().optional(),
                            icon_url: z.string().optional(),
                        }).optional(),
                        image: z.string().optional(),
                    })
                }),
                onlyIfWinSomeReward: z.boolean(),
            })
        })

        const userId = getJwtToken(req.cookies.auth!);

        if (!userId) return reply.status(401).send({ error: "Invalid token" });
        const member = await guild.members.fetch(userId).catch(() => null);
        const erisMember = await guild.members.fetch(client.user!.id).catch(() => null);

        if (!member) return reply.status(401).send({ error: "User not in guild" });
        if (!member.permissions.has("ManageGuild")) return reply.status(403).send({ error: "You don't have permission to manage this guild" });
        if (!erisMember) return reply.status(500).send({ error: "Eris member not found in guild" });

        const body = settingsBodySchema.parse(req.body);

        for (const level of body.levelGrant) {
            if (level.grant === "channel") {
                const channel = await guild.channels.fetch(level.id);
                if (!channel) return reply.status(404).send({ error: "Level grant: channel not found" });
                if (!channel.isTextBased()) return reply.status(400).send({ error: "Level grant: channel is not a text channel" });

                const erisMissingPermissions: string[] = [];
                const userMissingPermissions: string[] = [];
                if (!member.permissionsIn(channel).has("ViewChannel")) userMissingPermissions.push("ViewChannel");
                if (!member.permissionsIn(channel).has("SendMessages")) userMissingPermissions.push("SendMessages");
                if (!member.permissionsIn(channel).has("ManageChannels")) userMissingPermissions.push("ManageChannels");
                if (!erisMember.permissionsIn(channel).has("ViewChannel")) erisMissingPermissions.push("ViewChannel");
                if (!erisMember.permissionsIn(channel).has("SendMessages")) erisMissingPermissions.push("SendMessages");
                if (!erisMember.permissionsIn(channel).has("ManageChannels")) erisMissingPermissions.push("ManageChannels");
                if (!erisMember.permissionsIn(channel).has("ManageRoles")) erisMissingPermissions.push("ManageRoles");

                if (erisMissingPermissions.length > 0 || userMissingPermissions.length > 0) {
                    return reply.status(403).send({
                        error: "missing permissions",
                        eris: erisMissingPermissions,
                        user: userMissingPermissions,
                        channelId: channel.id,
                        channelName: channel.name,
                        type: "channel"
                    })
                }
            } else {
                const role = await guild.roles.fetch(level.id);
                if (!role) return reply.status(404).send({ error: "Level grant: role not found" })

                if (role.tags?.botId) {
                    return reply.status(403).send({
                        error: "Cannot use bot integration roles for level grants",
                        roleId: role.id,
                        roleName: role.name,
                    });
                };

                if (role.name === "@everyone") {
                    return reply.status(403).send({
                        error: "Cannot grant level grants to @everyone",
                        roleId: role.id,
                        roleName: role.name,
                    });
                }

                if (erisMember.roles.highest.comparePositionTo(role) <= 0) {
                    return reply.status(403).send({
                        error: "Eris highest role is not higher than the role you are trying to grant",
                        roleId: role.id,
                        roleName: role.name,
                    })
                }

                if (!erisMember.permissions.has("ManageRoles")) return reply.status(403).send({ error: "I don't have permission to manage roles" });
                if (!member.permissions.has("ManageRoles")) return reply.status(304).send({ error: "You don't have permission to manage roles" });
            }
        }

        if (body.warnLevelUp) {
            if (body.warnLevelUp.channel !== "current") {
                const channel = await guild.channels.fetch(body.warnLevelUp.channel);
                if (!channel) return reply.status(404).send({ error: "Warn level up: channel not found" });

                if (!member.permissionsIn(channel).has("SendMessages")) return reply.status(403).send({ error: "You don't have permission to send messages in this channel" });
                if (!erisMember.permissionsIn(channel).has("SendMessages")) return reply.status(403).send({ error: "I don't have permission to send messages in this channel" });

                if (!channel.isTextBased()) return reply.status(400).send({ error: "Warn level up: channel is not a text channel" })
            }
        }

        await prisma.guildSettings.upsert({
            where: {
                id: guildId
            },
            create: {
                id: guildId,
                chatBotChannels: body.chatBotChannels,
                chatBotEnabled: body.chatBotEnabled,
                channelsCommandDisabled: body.channelsCommandDisabled,
                channelsCommandDisabledIsHabilited: body.channelsCommandDisabledIsHabilited,
                channelsCommandEnabled: body.channelsCommandEnabled,
                channelsCommandEnabledIsHabilited: body.channelsCommandEnabledIsHabilited,
                xpSystemEnabled: body.xpSystemEnabled,
                difficulty: body.difficulty,
                rolesXpBonus: body.rolesXpBonus,
                rolesNotWinXp: body.rolesNotWinXp,
                channelsXpBonus: body.channelsXpBonus,
                channelsNotWinXp: body.channelsNotWinXp,
                levelGrant: body.levelGrant,
                warnLevelUp: body.warnLevelUp
            },
            update: {
                chatBotChannels: body.chatBotChannels,
                chatBotEnabled: body.chatBotEnabled,
                channelsCommandDisabled: body.channelsCommandDisabled,
                channelsCommandDisabledIsHabilited: body.channelsCommandDisabledIsHabilited,
                channelsCommandEnabled: body.channelsCommandEnabled,
                channelsCommandEnabledIsHabilited: body.channelsCommandEnabledIsHabilited,
                xpSystemEnabled: body.xpSystemEnabled,
                difficulty: body.difficulty,
                rolesXpBonus: body.rolesXpBonus,
                rolesNotWinXp: body.rolesNotWinXp,
                channelsXpBonus: body.channelsXpBonus,
                channelsNotWinXp: body.channelsNotWinXp,
                levelGrant: body.levelGrant,
                warnLevelUp: body.warnLevelUp
            }
        })

        setServerSettings(guildId, {
            ...body,
            warnLevelUp: { ...body.warnLevelUp, message: { ...body.warnLevelUp.message, embed: { ...body.warnLevelUp.message.embed, image: body.warnLevelUp.message.embed.image ?? undefined } } }
        })

        return reply.status(200).send({ message: "Guild settings updated" })
    })
}