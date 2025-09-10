import { prisma } from "#database";
import { Giveaway, RoleMultipleEntry, UserGiveaway, GuildGiveaway, GuildSettings } from "#prisma";
import { Client } from "discord.js";

export async function selectWinner(client: Client, giveaway: (Giveaway & { roleEntries: RoleMultipleEntry[] }), participants: UserGiveaway[], connectedGuilds: (GuildGiveaway & { guild: GuildSettings })[], quantity = 0) {
    const eligible = participants.filter(p => !p.isWinner);
    if (eligible.length === 0) return null;

    const goodOnesWithEntries = [];

    for (const p of eligible) {
        const userId = p.userId;

        // Coletar membros do Discord em cada guild
        const members: { [guildId: string]: import("discord.js").GuildMember | null } = {};
        let allPresent = true;
        for (const conn of connectedGuilds) {
            const guildId = conn.guildId;
            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;
            let member = guild.members.cache.get(userId) || null;
            if (!member) {
                try {
                    member = await guild.members.fetch(userId);
                } catch {
                    member = null;
                }
            }
            members[guildId] = member;
            if (!member) allPresent = false;
        }

        // Verificar serverStayRequired
        if (giveaway.serverStayRequired && !allPresent) continue;

        // Verificar blackListRoles por guild
        let blacklisted = false;
        for (const conn of connectedGuilds) {
            const member = members[conn.guildId];
            if (!member) continue;
            const blRoles = conn.blackListRoles;
            if (blRoles.some(roleId => member.roles.cache.has(roleId))) {
                blacklisted = true;
                break;
            }
        }
        if (blacklisted) continue;

        // Verificar requisito de XP
        let xpOk = true;
        for (const conn of connectedGuilds) {
            if (!conn.xpRequired) continue;
            const guildSettings = conn.guild;
            if (!guildSettings.xpSystemEnabled) continue;
            const memberPrisma = await prisma.guildMember.findUnique({
                where: {
                    guildId_id: { guildId: conn.guildId, id: userId }
                },
                select: { xp: true }
            });
            if (!memberPrisma || memberPrisma.xp < conn.xpRequired) {
                xpOk = false;
                break;
            }
        }
        if (!xpOk) continue;


        // Se passou em todos os checks, calcular entries (incluindo extras por roles)
        let entries = 1;
        for (const roleEntry of giveaway.roleEntries) {
            const { roleId, extraEntries } = roleEntry;
            let roleGuild = null;
            for (const conn of connectedGuilds) {
                const guild = client.guilds.cache.get(conn.guildId);
                if (guild && guild.roles.cache.has(roleId)) {
                    roleGuild = guild;
                    break;
                }
            }
            if (!roleGuild) continue;
            const member = members[roleGuild.id];
            if (member && member.roles.cache.has(roleId)) {
                entries += extraEntries;
            }
        }

        goodOnesWithEntries.push({ p, entries });
    }

   if (goodOnesWithEntries.length === 0) return null;

    const winners = [];
    const available = [...goodOnesWithEntries];
    const totalWinners = Math.min(quantity, goodOnesWithEntries.length);

    for (let i = 0; i < totalWinners; i++) {
        if (available.length === 0) break;

        // Calcular soma total de entradas
        const totalEntries = available.reduce((sum, { entries }) => sum + entries, 0);
        if (totalEntries === 0) break;

        // Seleção ponderada
        let random = Math.random() * totalEntries;
        let selected = null;
        let selectedIndex = -1;
        for (let j = 0; j < available.length; j++) {
            random -= available[j].entries;
            if (random <= 0) {
                selected = available[j].p;
                selectedIndex = j;
                break;
            }
        }
        if (!selected && available.length > 0) {
            selectedIndex = available.length - 1;
            selected = available[selectedIndex].p; // Fallback
        }
        if (selected) {
            winners.push(selected);
            available.splice(selectedIndex, 1); // Remove todas as entradas do usuário selecionado
        }
    }

    return winners.length > 0 ? winners : null;
}