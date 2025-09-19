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
    console.log(`DEBUG: Iniciando selectWinner para sorteio ${giveaway.id}`);
    console.log(`DEBUG: Participantes: ${participants.length} | RoleEntries: ${giveaway.roleEntries.length} | Winners needed: ${quantity || giveaway.usersWins}`);
    
    const eligible = participants.filter(p => !p.isWinner);
    if (eligible.length === 0) {
        console.log(`DEBUG: Nenhum participante elegível`);
        return null;
    }

    const goodOnesWithEntries = [];

    for (const p of eligible) {
        const userId = p.userId;
        console.log(`\nDEBUG: === Verificando participante ${userId} ===`);
        
        const { missing, members } = await verifyUserRequirements(client, giveaway, userId, connectedGuilds, false);
        console.log(`DEBUG: Missing requirements: ${JSON.stringify(missing)}`);
        
        if (missing.length > 0) {
            console.log(`DEBUG: Skipping ${userId} por missing requirements`);
            continue;
        }

        // Calcular entries (base = 1, + extras por roles)
        let entries = 1;
        console.log(`DEBUG: Base entries para ${userId}: ${entries}`);
        
        for (const roleEntry of giveaway.roleEntries) {
            const { roleId, extraEntries } = roleEntry;
            console.log(`DEBUG: Verificando roleEntry ${roleId} com ${extraEntries} extra entries`);
            
            let roleGuild: Guild | null = null;
            for (const conn of connectedGuilds) {
                const guild = client.guilds.cache.get(conn.guildId);
                if (guild && guild.roles.cache.has(roleId)) {
                    roleGuild = guild;
                    break;
                }
            }
            
            if (!roleGuild) {
                console.log(`DEBUG: Role ${roleId} não encontrada em nenhuma guild`);
                continue;
            }
            
            const member = members[roleGuild.id];
            if (member && member.roles.cache.has(roleId)) {
                entries += extraEntries;
                console.log(`DEBUG: +${extraEntries} entries por role ${roleId}. Total: ${entries}`);
            }
        }

        console.log(`DEBUG: User ${userId} passou com ${entries} entries totais`);
        goodOnesWithEntries.push({ p, entries });
    }

    console.log(`DEBUG: Total elegíveis: ${goodOnesWithEntries.length}`);
    if (goodOnesWithEntries.length === 0) {
        console.log(`DEBUG: Nenhum participante passou nos requisitos`);
        return null;
    }

    // Usar usersWins do giveaway se quantity não foi passado
    const totalWinners = Math.min(quantity || giveaway.usersWins || 1, goodOnesWithEntries.length);
    console.log(`DEBUG: Selecionando ${totalWinners} de ${goodOnesWithEntries.length} elegíveis`);

    const winners = [];
    const available = [...goodOnesWithEntries];

    for (let i = 0; i < totalWinners; i++) {
        if (available.length === 0) {
            console.log(`DEBUG: Sem mais candidatos disponíveis`);
            break;
        }

        const totalEntries = available.reduce((sum, { entries }) => sum + entries, 0);
        console.log(`DEBUG: Round ${i + 1} - Total entries: ${totalEntries}, candidatos: ${available.length}`);

        if (totalEntries === 0) {
            console.log(`DEBUG: Total entries = 0, impossível`);
            break;
        }

        // Algoritmo de seleção ponderada SIMPLIFICADO
        let random = Math.random() * totalEntries;
        let selectedIndex = -1;

        console.log(`DEBUG: Random: ${random.toFixed(3)} / ${totalEntries}`);

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
            console.log(`DEBUG: Fallback: selecionando primeiro da lista`);
        }

        const selected = available[selectedIndex].p;
        console.log(`DEBUG: Vencedor ${i + 1}: ${selected.userId} (entries: ${available[selectedIndex].entries})`);
        
        winners.push(selected);
        available.splice(selectedIndex, 1);
    }

    console.log(`DEBUG: Vencedores finais: ${winners.map(w => w.userId).join(', ')}`);
    return winners.length > 0 ? winners : null;
}