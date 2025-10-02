import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { petSpin } from "./subCommands/spin.js";
import { icon, res } from "#functions";
import { adoptPetCommand } from "./subCommands/adopt.js";
import { realeasePetCommand } from "./subCommands/release.js";
import { prisma } from "#database";
import { petInfoCommand } from "./subCommands/petInfo.js";

createCommand({
    name: "pet",
    description: "pet commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "spin",
            description: "spin and get a random pet",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "es-ES": "girar",
                "pt-BR": "roleta"
            },
            descriptionLocalizations: {
                "es-ES": "gira y consigue una mascota aleatoria",
                "pt-BR": "gire a roleta e consiga um pet aleatório"
            }
        },
        {
            name: "adopt",
            description: "adopt a pet from the center",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "es-ES": "adoptar",
                "pt-BR": "adotar"
            },
            descriptionLocalizations: {
                "es-ES": "adopta una mascota del centro de adopción",
                "pt-BR": "adote um pet do centro de adoção"
            }
        },
        {
            name: "release",
            description: "send your pet to the adoption center",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "es-ES": "liberar",
                "pt-BR": "liberar"
            },
            descriptionLocalizations: {
                "es-ES": "envía tu mascota al centro de adopción",
                "pt-BR": "envie seu pet para o centro de adoção"
            },
            options: [
                {
                    name: "pet",
                    description: "pet to sent to the adoption center",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: "info",
            description: "view details of a pet",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pet",
                    description: "pet id",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    autocomplete: true
                }
            ],
            nameLocalizations: {
                "es-ES": "información",
                "pt-BR": "informações"
            },
            descriptionLocalizations: {
                "es-ES": "ver detalles de una mascota",
                "pt-BR": "veja detalhes de um pet"
            }
        }
    ],
    nameLocalizations: {
        "es-ES": "mascota",
        "pt-BR": "pet"
    },
    descriptionLocalizations: {
        "es-ES": "comandos de mascota",
        "pt-BR": "comandos de pet"
    },
    async autocomplete(interaction) {
        const { user, options } = interaction;
        const focused = options.getFocused(true);
        // const subcommand = options.getSubcommand();

        if (focused.name === "pet") {
            const pets = await prisma.userPet.findMany({
                where: {
                    userId: user.id,
                    name: {
                        contains: focused.value,
                        mode: "insensitive"
                    }
                },
                select: {
                    id: true,
                    name: true
                }
            });
            await interaction.respond(pets.map(pet => ({ name: pet.name, value: pet.id.toString() })));
            return;
        }

        return await interaction.respond([{ name: "Essa função ainda não foi implementada", value: "null" }]);
    },
    async run(interaction) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "spin": {
                await petSpin(interaction);
                break;
            }
            case "adopt": {
                await adoptPetCommand(interaction);
                break;
            }
            case "release": {
                await realeasePetCommand(interaction);
                break;
            }
            case "info": {
                await petInfoCommand(interaction);
                break;
            }
            default: {
                await interaction.reply(res.danger(`${icon.Eris_cry} | Eu procurei por toda parte mas não achei esse comando!`))
                break;
            }
        }
    }
});