import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { ErisError, SimulatedMatch } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "fooball/simulatedMatch/:time/:matchId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            time: params.time as "first" | "second" | "extra" | "penalties",
            matchId: BigInt(params.matchId)
        }
    },
    async run(interaction, { time, matchId }) {
        await interaction.deferUpdate();
        const raw = await redis.get(`football:simulate:${matchId}`);

        if (!raw) throw new ErisError("Faz muito tempo que simulei essa partida, eu acabei esquecendo dela!");

        const simulatedMatch = JSON.parse(raw) as SimulatedMatch;

        const match = await prisma.footballMatch.findUnique({
            where: {
                id: matchId
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true
            }
        });

        if (!match) throw new ErisError("Essa partida não existe mais!");

        await interaction.editReply(menus.football.matches.simulatedMatch({
            match,
            ...simulatedMatch
        }, time))
    },
});