import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";
import { userMention } from "discord.js";

createResponder({
    customId: "giveaway/participants/:giveawayId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            giveawayId: Number(params.giveawayId)
        }
    },
    async run(interaction, { giveawayId }) {
        await interaction.deferReply({ flags: "Ephemeral" });

        const giveaway = await prisma.giveaway.findUnique({
            where: {
                id: giveawayId
            },
            select: {
                title: true,
                participants: true
            }
        });

        if (!giveaway) {
            interaction.editReply(resv2.danger(`${icon.error} | EU procurei por toda parte mas não encontrei dados desse sorteio!`));
            return;
        }
        if (giveaway.participants.length < 1) {
            interaction.editReply(resv2.danger(`${icon.error} | Nenhum usuário está participando do sorteio!`))
            return;
        }

        interaction.editReply(resv2.success(
            `### ${giveaway.title}`,
            giveaway.participants.map(p => `${userMention(p.userId)} - **\`${interaction.client.users.cache.get(p.userId)?.displayName || 'Não encontrado'}\`**`).join("\n")
        ))
        return;
    },
});