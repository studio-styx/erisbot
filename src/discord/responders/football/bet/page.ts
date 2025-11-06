import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { ErisError } from "#functions";
import { menus } from "#menus";
import { userMention } from "discord.js";

createResponder({
    customId: "football/bet/page/:page/:userId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            page: +params.page,
            userId: params.userId
        }
    },
    async run(interaction, { page, userId }) {
        if (interaction.user.id !== userId) throw new ErisError(`Apenas ${userMention(userId)} pode acessar esse botão!`);
        await interaction.deferUpdate();

        const bets = await prisma.footballBet.findMany({
            where: {
                userId
            },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                        competition: true
                    }
                }
            }
        });

        await interaction.editReply(menus.football.bets.betsMenu(bets, page));
    },
});