import { Giveaway, RoleMultipleEntry, UserGiveaway, GuildGiveaway, GuildSettings } from "#prisma";
import { Client, Guild } from "discord.js";
import { verifyUserRequirements } from "./verifyUserRequirements.js";

export async function selectWinner(
    client: Client,
    giveaway: Giveaway & { roleEntries: RoleMultipleEntry[] },
    participants: UserGiveaway[],
    connectedGuilds: (GuildGiveaway & { guild: GuildSettings })[],
    quantity: number = 0
) {
    const eligible = participants.filter(p => !p.isWinner);
    if (eligible.length === 0) {
        return null;
    }

    const goodOnesWithEntries = [];

    for (const p of eligible) {
        const userId = p.userId;
        const { missing, members } = await verifyUserRequirements(client, giveaway, userId, connectedGuilds, false);

        if (missing.length > 0) {
            continue;
        }

        // Calcular entries (base = 1, + extras por roles)
        let entries = 1;
        
        for (const roleEntry of giveaway.roleEntries) {
            const { roleId, extraEntries } = roleEntry;
            
            let roleGuild: Guild | null = null;
            for (const conn of connectedGuilds) {
                const guild = client.guilds.cache.get(conn.guildId);
                if (guild && guild.roles.cache.has(roleId)) {
                    roleGuild = guild;
                    break;
                }
            }
            
            if (!roleGuild) {
                continue;
            }
            
            const member = members[roleGuild.id];
            if (member && member.roles.cache.has(roleId)) {
                entries += extraEntries;
            }
        }

        goodOnesWithEntries.push({ p, entries });
    }

    if (goodOnesWithEntries.length === 0) {
        return null;
    }

    // Usar usersWins do giveaway se quantity não foi passado
    const totalWinners = Math.min(quantity || giveaway.usersWins || 1, goodOnesWithEntries.length);

    const winners = [];
    const available = [...goodOnesWithEntries];

    for (let i = 0; i < totalWinners; i++) {
        if (available.length === 0) {
            break;
        }

        const totalEntries = available.reduce((sum, { entries }) => sum + entries, 0);

        if (totalEntries === 0) {
            break;
        }

        // Algoritmo de seleção ponderada SIMPLIFICADO
        let random = Math.random() * totalEntries;
        let selectedIndex = -1;

        // Encontrar o índice baseado nas entries acumuladas
        let cumulative = 0;
        for (let j = 0; j < available.length; j++) {
            cumulative += available[j].entries;
            if (random <= cumulative) {
                selectedIndex = j;
                break;
            }
        }

        // GARANTIR que sempre seleciona alguém
        if (selectedIndex === -1) {
            selectedIndex = 0; // Primeiro da lista como fallback
        }

        const selected = available[selectedIndex].p;
  
        winners.push(selected);
        available.splice(selectedIndex, 1);
    }

    return winners.length > 0 ? winners : null;
}