import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { footballMatchesCommand } from "./subCommands/matches.js";
import { prisma } from "#database";
import { limitText } from "@magicyan/discord";

createCommand({
    name: "football",
    description: "football api bet commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "matches",
            description: "see all football matches",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "match",
                    description: "select a match",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    autocomplete: true
                }
            ]
        }
    ],
    async autocomplete(interaction) {
        const { options } = interaction;
        const subCommand = options.getSubcommand();
        const focused = options.getFocused(true);

        switch (subCommand) {
            case "matches": {
                const matches = await prisma.footballMatch.findMany({
                    where: {
                        startAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lte: new Date(new Date().setDate(new Date().getDate() + 7))
                        },
                        OR: [
                            {
                                homeTeam: {
                                    name: {
                                        contains: focused.value,
                                        mode: "insensitive"
                                    }
                                }
                            },
                            {
                                awayTeam: {
                                    name: {
                                        contains: focused.value,
                                        mode: "insensitive"
                                    }
                                }
                            },
                            {
                                competition: {
                                    name: {
                                        contains: focused.value,
                                        mode: "insensitive"
                                    }
                                }
                            }
                        ]
                    },
                    select: {
                        homeTeam: {
                            select: {
                                name: true
                            }
                        },
                        awayTeam: {
                            select: {
                                name: true
                            }
                        },
                        competition: {
                            select: {
                                name: true
                            }
                        },
                        id: true,
                        startAt: true
                    },
                    take: 25,
                    orderBy: [
                        {
                            bets: {
                                _count: "desc"
                            }
                        },
                        {
                            startAt: "asc"
                        },
                        {
                            goalsHome: "desc"
                        },
                        {
                            goalsAway: "desc"
                        },
                        {
                            homeTeam: {
                                name: "asc"
                            }
                        },
                        {
                            awayTeam: {
                                name: "asc"
                            }
                        },
                        {
                            competition: {
                                name: "asc"
                            }
                        }
                    ]
                });

                if (matches.length === 0) {
                    return await interaction.respond([{ name: "Nenhuma partida encontrada", value: "" }]);
                }

                return await interaction.respond(matches.map(m => ({ name: limitText(`${m.homeTeam.name} x ${m.awayTeam.name} || ${m.competition.name} ||| ${m.startAt.toLocaleString()}`, 97, "..."), value: m.id.toString() })));
            }
        }
    },
    async run(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "matches":
                await footballMatchesCommand(interaction);
                break;
        }
    }
});