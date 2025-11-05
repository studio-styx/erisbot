import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { footballMatchesCommand } from "./subCommands/matches.js";
import { prisma } from "#database";
import { limitText } from "@magicyan/discord";
import { footballBetsCommand } from "./subCommands/footballBetsCommand.js";
import { footballUserFavoriteTeam } from "./subCommands/favoriteTeam.js";

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
        },
        {
            name: "bets",
            description: "view your bets",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "favorite_team",
            description: "favorite a team",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "team",
                    description: "select a team",
                    type: ApplicationCommandOptionType.String,
                    required: true,
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
            case "favorite_team": {
                const teams = await prisma.footballTeam.findMany({
                    where: {
                        name: {
                            contains: focused.value,
                            mode: "insensitive"
                        }
                    },
                    select: {
                        name: true,
                        id: true
                    },
                    take: 25
                });

                if (teams.length === 0) return await interaction.respond([{ name: "Nenhum time encontrado", value: "x" }]);

                return await interaction.respond(teams.map(t => ({ name: t.name, value: t.id.toString() })))
            }
        }
    },
    async run(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "matches":
                await footballMatchesCommand(interaction);
                break;
            case "bets": 
                await footballBetsCommand(interaction);
                break;
            case "favorite_team":
                await footballUserFavoriteTeam(interaction);
                break;
        }
    }
});