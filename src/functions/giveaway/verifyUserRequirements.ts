import { prisma } from "#database";
import { Giveaway, RoleMultipleEntry, GuildGiveaway, GuildSettings } from "#prisma";
import { Client, GuildMember } from "discord.js";

export async function verifyUserRequirements(
    client: Client,
    giveaway: Giveaway & { roleEntries: RoleMultipleEntry[] },
    userId: string,
    connectedGuilds: (GuildGiveaway & { guild: GuildSettings })[],
    inPortuguese: boolean = true
): Promise<{ missing: string[]; members: Record<string, GuildMember | null> }> {
    const missing: string[] = [];
    const members: Record<string, GuildMember | null> = {};
    const missingGuilds: string[] = [];

    const memberFetchPromises = connectedGuilds.map(async (conn) => {
        const guildId = conn.guildId;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`DEBUG: Guild ${guildId} não encontrada para user ${userId}`);
            return { guildId, member: null };
        }

        let member: GuildMember | null = guild.members.cache.get(userId) || null;
        if (!member) {
            try {
                member = await guild.members.fetch(userId);
                console.log(`DEBUG: Fetch sucesso para user ${userId} em guild ${guildId}`);
            } catch (error: any) {
                console.error(`DEBUG: Erro ao fetch member ${userId} em ${guildId}: ${error.message}`);
                member = null;
            }
        } else {
            console.log(`DEBUG: Member ${userId} encontrado no cache em ${guildId}`);
        }
        return { guildId, member };
    });

    const fetchedMembers = await Promise.all(memberFetchPromises);

    fetchedMembers.forEach(({ guildId, member }) => {
        members[guildId] = member;
        if (!member) missingGuilds.push(guildId);
    });

    console.log(`DEBUG: Para user ${userId} em sorteio ${giveaway.id} | Missing guilds: ${missingGuilds.join(', ')} | Stay required: ${giveaway.serverStayRequired}`);

    if (giveaway.serverStayRequired && missingGuilds.length > 0) {
        console.log(`DEBUG: Adicionando missing para stay required para user ${userId}`);
        if (inPortuguese) {
            const guildNamePromises = missingGuilds.map(async (guildId) => {
                const guild = client.guilds.cache.get(guildId) ?? (await client.guilds.fetch(guildId).catch(() => null));
                return `Você precisa estar no servidor **${guild?.name ?? guildId}** para participar!`;
            });
            const guildMessages = await Promise.all(guildNamePromises);
            missing.push(...guildMessages);
        } else {
            missingGuilds.forEach((guildId) => {
                missing.push(`missingServerStay:${guildId}`);
            });
        }
    }

    const blacklistedChecks: Promise<string>[] = [];
    for (const conn of connectedGuilds) {
        const member = members[conn.guildId];
        if (!member) continue;
        const blRoles = conn.blackListRoles;
        console.log(`DEBUG: Verificando blackListRoles para guild ${conn.guildId}: roles ${blRoles.join(', ')}`);
        for (const roleId of blRoles) {
            if (member.roles.cache.has(roleId)) {
                console.log(`DEBUG: User ${userId} has blacklisted role ${roleId} in ${conn.guildId}`);
                if (inPortuguese) {
                    blacklistedChecks.push((async () => {
                        const guild = client.guilds.cache.get(conn.guildId) ?? (await client.guilds.fetch(conn.guildId).catch(() => null));
                        const role = guild?.roles.cache.get(roleId) ?? (await guild?.roles.fetch(roleId).catch(() => null));
                        return `Você possui o cargo proibido **${role?.name ?? roleId}** no servidor **${guild?.name ?? conn.guildId}**!`;
                    })());
                } else {
                    console.log(`DEBUG: Adding blacklistedRole for user ${userId}: ${roleId} in guild ${conn.guildId}`);
                    missing.push(`blacklistedRole:${roleId}:${conn.guildId}`);
                }
            }
        }
    }
    if (blacklistedChecks.length > 0) {
        const blacklistedMessages = await Promise.all(blacklistedChecks);
        missing.push(...blacklistedMessages);
    }

    const xpCheckPromises = connectedGuilds
        .filter(conn => {
            const shouldCheck = conn.xpRequired && conn.guild.xpSystemEnabled;
            console.log(`DEBUG: Checking XP for guild ${conn.guildId}: required ${conn.xpRequired}, enabled ${conn.guild.xpSystemEnabled}, will check: ${shouldCheck}`);
            return shouldCheck;
        })
        .map(async (conn) => {
            const memberPrisma = await prisma.guildMember.findUnique({
                where: {
                    guildId_id: { guildId: conn.guildId, id: userId }
                },
                select: { xp: true }
            });
            console.log(`DEBUG: XP for user ${userId} in ${conn.guildId}: ${memberPrisma?.xp ?? 'none'}`);
            if (!memberPrisma || memberPrisma.xp < (conn.xpRequired ?? 0)) {
                console.log(`DEBUG: Adding missingXp for user ${userId} in guild ${conn.guildId}: required ${conn.xpRequired}, has ${memberPrisma?.xp ?? 'none'}`);
                if (inPortuguese) {
                    const guild = client.guilds.cache.get(conn.guildId) ?? (await client.guilds.fetch(conn.guildId).catch(() => null));
                    return `Você precisa de **${conn.xpRequired}** xp no servidor **${guild?.name ?? conn.guildId}** para participar desse sorteio!`;
                } else {
                    return `missingXp:${conn.xpRequired}:${conn.guildId}`;
                }
            }
            return null;
        });

    const xpMissing = (await Promise.all(xpCheckPromises)).filter((msg): msg is string => msg !== null);
    missing.push(...xpMissing);

    console.log(`DEBUG: Requisitos missing finais para user ${userId}: ${JSON.stringify(missing)}`);

    return { missing, members };
}