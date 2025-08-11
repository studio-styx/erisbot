import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { menus } from "#menus";

createResponder({
    customId: "xpSystem/rank/:page/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, userId }) {
        await interaction.deferUpdate();

        const ranking = await prisma.guildMember.findMany({
            where: { guildId: interaction.guildId },
            orderBy: { xp: "desc" },
            select: { id: true, xp: true }
        });

        const guildMembers = await interaction.guild.members.fetch();
        
        if (userId !== interaction.user.id) {
            interaction.followUp(menus.xpSystem.rank(ranking, interaction.user.id, guildMembers.map(m => ({
                displayName: m.displayName,
                id: m.id
            })), Number(page)));
            return;
        }
        interaction.editReply(menus.xpSystem.rank(ranking, interaction.user.id, guildMembers.map(m => ({
            displayName: m.displayName,
            id: m.id,
            avatarUrl: m.displayAvatarURL() || undefined
        })), Number(page)));
        return;
    },
});