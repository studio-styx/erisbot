import { petAnimalFormatted, petRarityFormatted } from "#functions";
import { AdoptionCenter, PersonalityTrait, Pet, UserPet, UserPetPersonality } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

export function adoptionCenterMenu<R>(allPets: (AdoptionCenter & { userPet: (UserPet & { pet: Pet, personality: (UserPetPersonality & { trait: PersonalityTrait })[] }) })[], page = 0): R {
    const petsPerPage = 6;
    const startIndex = page * petsPerPage;
    const endIndex = startIndex + petsPerPage;
    const pets = allPets.slice(startIndex, endIndex);
    
    const components: any[] = [
        brBuilder(
            "## Centro de adoção",
            "Aqui estarão armazenado os pets jogados para adoção por outros players"
        ),
        createSeparator()
    ]

    for (const pet of pets) {
        components.push(
            brBuilder(
                `**Nome:** ${pet.userPet.name}`,
                `**Gênero:** ${pet.userPet.gender === "MALE" ? "Macho" : "Fêmea"}`,
                `**Animal:** ${petAnimalFormatted[pet.userPet.pet.animal]}`,
                `**Raridade:** ${petRarityFormatted[pet.userPet.pet.rarity]}`,
                `**Espécie:** ${pet.userPet.pet.specie}`,
                `**Personalidades:** ${pet.userPet.personality.map(p => p.trait.name).join(", ")}`,
                `**ID:** ${pet.userPet.id}`,
                `**Some:** ${time(pet.deleteIn, "R")}`
            ),
            createRow(
                new ButtonBuilder({
                    customId: `pet/adoptionCenter/adopt/${pet.id}`,
                    label: "Adotar",
                    style: ButtonStyle.Success
                })
            )
        )
        createSeparator()
    }

    components.push(
        createRow(
            new ButtonBuilder({
                customId: `pet/adoptionCenter/page/${page - 1}`,
                label: "Voltar",
                style: ButtonStyle.Secondary,
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `pet/adoptionCenter/page/${page + 1}`,
                label: "Avançar",
                style: ButtonStyle.Secondary,
                disabled: endIndex >= allPets.length
            }),
        )
    )

    const container = createContainer(settings.colors.fuchsia, ...components);

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}