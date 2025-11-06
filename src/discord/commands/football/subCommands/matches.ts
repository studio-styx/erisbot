import { Store } from "#base";
import { prisma } from "#database";
import { ErisError, getBrazilTime } from "#functions";
import { menus } from "#menus";
import { ChatInputCommandInteraction, time } from "discord.js";
import z from "zod";

const cooldowns = new Store<Date>();

export async function footballMatchesCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const cooldown = cooldowns.get(interaction.user.id);
    if (cooldown) throw new ErisError(`Hey! você está sendo muito rápido! tente novamente ${time(cooldown, "R")}`)
    await interaction.deferReply();

    const matchSelected = interaction.options.getString("match");
    if (matchSelected) {
        const matchSchema = z.coerce.bigint("O id da partida deve ser um número inteiro.")
            .positive("O id da partida deve ser maior que 0.");
            
        const matchId = matchSchema.parse(matchSelected);
        const [matchData, userData] = await prisma.$transaction([
            prisma.footballMatch.findUnique({
                where: { id: matchId },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    competition: true
                }
            }),
            prisma.user.upsert({
                where: { id: interaction.user.id },
                create: { id: interaction.user.id },
                update: {},
                select: {
                    bets: {
                        where: {
                            matchId,
                            status: {
                                not: "CANCELED"
                            }
                        }
                    }
                }
            })
        ])

        if (!matchData) throw new ErisError("Eu não consegui encontrar essa partida!")

        await interaction.editReply(menus.football.matches.matchMenu(matchData, {
            bets: userData.bets,
            id: interaction.user.id,
            displayAvatarURL: interaction.user.displayAvatarURL
        }))
        return
    }

    const now = getBrazilTime();

    const dateFrom = now;
    dateFrom.setHours(0, 0, 0, 0);

    const dateTo = now;
    dateTo.setHours(23, 59, 59, 999);

    const matches = await prisma.footballMatch.findMany({
        where: {
            startAt: {
                gte: dateFrom,
                lte: dateTo
            }
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            competition: true
        },
        orderBy: [
            { competition: { name: "asc" } },
            { startAt: "asc" }
        ]
    });

    cooldowns.set(interaction.user.id, new Date(new Date().getTime() + 1000 * 60), {
        time: 1000 * 60
    });

    await interaction.editReply(menus.football.matches.matchesMenu(matches, interaction.user.displayAvatarURL(), now))
    return;
}