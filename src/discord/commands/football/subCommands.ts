import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { footballMatchesCommand } from "./subCommands/matches.js";
import { prisma } from "#database";

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
                            gte: new Date(new Date().setDate(new Date().getDate() - 3)),
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
                        id: true
                    },
                    take: 25
                });

                if (matches.length === 0) {
                    return await interaction.respond([{ name: "Nenhuma partida encontrada", value: "" }]);
                }

                return await interaction.respond(matches.map(m => ({ name: `${m.homeTeam.name} x ${m.awayTeam.name}`, value: m.id.toString() })));
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