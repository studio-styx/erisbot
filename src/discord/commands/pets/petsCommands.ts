import { createCommand, Store } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { petSpin } from "./subCommands/spin.js";
import { getValidUserPet, icon, res, verifyPetName } from "#functions";
import { adoptPetCommand } from "./subCommands/adopt.js";
import { realeasePetCommand } from "./subCommands/release.js";
import { prisma } from "#database";
import { petInfoCommand } from "./subCommands/petInfo.js";
import { petCareCommand } from "./subCommands/petCare.js";
import { petReproductionCommand } from "./subCommands/petReproduction.js";
import { UserPet } from "#prisma";
import { changePetName } from "./subCommands/changePetName.js";
import { setActivePet } from "./subCommands/setActivePet.js";

const cache = new Store<UserPet>();

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
                    required: true,
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
        },
        {
            name: "care",
            nameLocalizations: {
                "pt-BR": "cuidar",
                "es-ES": "cuidar"
            },
            description: "take care of your pet",
            descriptionLocalizations: {
                "pt-BR": "cuidar de seu pet",
                "es-ES": "cuidar de tu mascota"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pet",
                    nameLocalizations: {
                        "pt-BR": "pet",
                        "es-ES": "mascota"
                    },
                    description: "pet to take care of",
                    descriptionLocalizations: {
                        "pt-BR": "pet para cuidar",
                        "es-ES": "mascota para cuidar"
                    },
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                }
            ]
        },
        {
            name: "breed",
            nameLocalizations: {
                "pt-BR": "reproduzir",
                "es-ES": "reproducir"
            },
            description: "breed two pets",
            descriptionLocalizations: {
                "pt-BR": "reproduzir dois pets",
                "es-ES": "reproducir dos mascotas"
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pet1",
                    nameLocalizations: {
                        "pt-BR": "pet1",
                        "es-ES": "mascota1"
                    },
                    description: "first pet to breed",
                    descriptionLocalizations: {
                        "pt-BR": "primeiro pet para reproduzir",
                        "es-ES": "primera mascota para reproducir"
                    },
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                },
                {
                    name: "pet2",
                    nameLocalizations: {
                        "pt-BR": "pet2",
                        "es-ES": "mascota2"
                    },
                    description: "second pet to breed (if it doesn’t appear then it’s not compatible)",
                    descriptionLocalizations: {
                        "pt-BR": "segundo pet para reproduzir (se não aparecer então não é compatível)",
                        "es-ES": "segunda mascota para reproducir (si no aparece entonces no es compatible)"
                    },
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                }
            ]
        },
        {
            name: "change_name",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "mudar_nome",
                "es-ES": "cambiar_nombre"
            },
            description: "change your pet name",
            descriptionLocalizations: {
                "pt-BR": "mude o nome do seu pet",
                "es-ES": "cambie el nombre de su mascota"
            },
            options: [
                {
                    name: "pet",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true,
                    nameLocalizations: {
                        "pt-BR": "pet",
                        "es-ES": "mascota"
                    },
                    description: "pet to change name",
                    descriptionLocalizations: {
                        "pt-BR": "pet para mudar nome",
                        "es-ES": "mascota para cambiar nombre"
                    }
                },
                {
                    name: "name",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "nome",
                        "es-ES": "nombre"
                    },
                    description: "new name",
                    descriptionLocalizations: {
                        "pt-BR": "novo nome",
                        "es-ES": "nuevo nombre"
                    }
                }
            ]
        },
        {
            name: "set_active_pet",
            description: "set your active pet",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pet",
                    description: "pet to set as active",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "pet",
                        "es-ES": "mascota"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "pet para ativar",
                        "es-ES": "mascota para activar"
                    }
                }
            ],
            nameLocalizations: {
                "es-ES": "activar_mascota",
                "pt-BR": "ativar_pet"
            },
            descriptionLocalizations: {
                "es-ES": "activar una mascota",
                "pt-BR": "ativar um pet"
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
        const subcommand = options.getSubcommand();

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
                    name: true,
                    pet: { select: { animal: true, specie: true } }
                },
                take: 25
            });
            await interaction.respond(pets.map(pet => ({ name: `${pet.name} - (${pet.pet.animal} - ${pet.pet.specie})`, value: pet.id.toString() })));
            return;
        }

        switch (subcommand) {
            case "breed": {
                if (focused.name === "pet1") {
                    const pets = await prisma.userPet.findMany({
                        where: {
                            userId: user.id,
                            name: {
                                contains: focused.value,
                                mode: "insensitive"
                            },
                            pregnantEndAt: null,
                            isPregnant: false,
                            adoption: null,
                            isDead: false,
                        },
                        select: {
                            id: true,
                            name: true,
                            pet: { select: { animal: true, specie: true } }
                        },
                        take: 25
                    });

                    if (pets.length < 1) {
                        return await interaction.respond([{ name: "não existe pets disponiveis!", value: "null" }])
                    }

                    await interaction.respond(pets.map(pet => ({ name: `${pet.name} - (${pet.pet.animal} - ${pet.pet.specie})`, value: pet.id.toString() })));
                } else {
                    const pet1Id = Number(options.getString("pet1"));

                    const pet1Info = await prisma.userPet.findUnique({
                        where: {
                            id: pet1Id,
                            pregnantEndAt: null,
                            isPregnant: false,
                            adoption: null,
                            isDead: false,
                        },
                        include: {
                            pet: true
                        }
                    });

                    if (!pet1Info) {
                        return await interaction.respond([{ name: "pet 1 inválido!", value: "null" }])
                    }

                    const pets = await prisma.userPet.findMany({
                        where: {
                            userId: user.id,
                            id: { not: pet1Id },
                            name: {
                                contains: focused.value,
                                mode: "insensitive"
                            },
                            gender: { not: pet1Info.gender },
                            pet: {
                                animal: pet1Info.pet.animal
                            },
                            parent1: {
                                id: { not: pet1Id },
                                childsAsParent1: {
                                    none: {
                                        id: pet1Id
                                    }
                                },
                                childsAsParent2: {
                                    none: {
                                        id: pet1Id
                                    }
                                }
                            },
                            parent2: {
                                id: { not: pet1Id },
                                childsAsParent1: {
                                    none: {
                                        id: pet1Id
                                    }
                                },
                                childsAsParent2: {
                                    none: {
                                        id: pet1Id
                                    }
                                }
                            },
                            childsAsParent1: {
                                none: {
                                    id: pet1Id
                                }
                            },
                            childsAsParent2: {
                                none: {
                                    id: pet1Id
                                }
                            },
                            pregnantEndAt: null,
                            isPregnant: false,
                            adoption: null,
                            isDead: false,
                        },
                        select: {
                            id: true,
                            name: true,
                            pet: { select: { animal: true, specie: true } }
                        },
                        take: 25
                    });

                    if (pets.length < 1) {
                        return await interaction.respond([{ name: "não existe pets disponiveis!", value: "null" }])
                    }

                    await interaction.respond(pets.map(pet => ({ name: `${pet.name} - (${pet.pet.animal} - ${pet.pet.specie})`, value: pet.id.toString() })));
                }
                return;
            }
            case "change_name": {
                if (focused.name === "name") {
                    const petId = Number(options.getString("pet"));
                    const getPet = async (petId: number) => {
                        const cachedPet = cache.get(`${petId}`);
                        if (cachedPet) return cachedPet;

                        const pet = await getValidUserPet(petId, user.id)
                        if (!pet) return null;
                        cache.set(`${petId}`, pet, { time: 1000 * 60 * 5 });
                        return pet;
                    }
                    const pet = await getPet(petId);
                    if (!pet) {
                        return await interaction.respond([{ name: "pet inválido!", value: "null" }])
                    }

                    const newName = focused.value;
                    if (!newName) {
                        return await interaction.respond([{ name: "o nome não pode ser vazio!", value: "null" }]);
                    }
                    if (pet.name === newName) {
                        return await interaction.respond([{ name: "o nome não pode ser igual ao nome atual!", value: "null" }]);
                    }
                    const errorName = verifyPetName(newName);
                    if (errorName.length > 0) {
                        return await interaction.respond(errorName.map((error, index) => ({ name: error, value: `null-${index}` })));
                    }
                    return await interaction.respond([{ name: newName, value: newName }]);
                }
            }
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
            case "care": {
                await petCareCommand(interaction);
                break;
            }
            case "breed": {
                await petReproductionCommand(interaction);
                break;
            }
            case "change_name": {
                await changePetName(interaction);
                break;
            }
            case "set_active_pet": {
                await setActivePet(interaction);
                break;
            }
            default: {
                await interaction.reply(res.danger(`${icon.Eris_cry} | Eu procurei por toda parte mas não achei esse comando!`))
                break;
            }
        }
    }
});