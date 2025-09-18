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
    if (eligible.length === 0) return null;

    const goodOnesWithEntries = [];

    for (const p of eligible) {
        const userId = p.userId;
        const { missing, members } = await verifyUserRequirements(client, giveaway, userId, connectedGuilds, false);
        if (missing.length > 0) continue;

        // Calcular entries (incluindo extras por roles)
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

        const totalEntries = available.reduce((sum, { entries }) => sum + entries, 0);
        if (totalEntries === 0) break;

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