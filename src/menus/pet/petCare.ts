import { petsFood } from "#functions";
import { Pet, UserPet } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function petCareMenu<R>(userId: string, pet: UserPet & { personality: { trait: { name: string } }[], pet: Pet }, page?: "feed" | "play"): R {
    const components: any[] = [
        brBuilder(
            `## Cuidados com pet: ${pet.name}`
        ),
        createSeparator(),
        brBuilder(
            `**Fome:** ${pet.hungry}/100`,
            `**Felicidade:** ${pet.happiness}/100`,
            `**Humor:** ${pet.humor}`,
            `**Gênero:** ${pet.gender === "MALE" ? "Macho" : "Fêmea"}`,
            `**Personalidade:** ${pet.personality.map(p => p.trait.name).join(", ")}`
        ),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `pet/care/feed/${userId}/${pet.id}`,
                label: "Alimentar",
                style: ButtonStyle.Success,
                disabled: !!page || pet.hungry === 100,
            }),
            new ButtonBuilder({
                customId: `pet/care/play/${userId}/${pet.id}`,
                label: "Brincar",
                style: ButtonStyle.Success,
                disabled: !!page || pet.happiness === 100 ? (pet.humor === "happy" || pet.humor === "veryHappy" || pet.humor === "playful") ? true : false : true,
            }),
            new ButtonBuilder({
                customId: `pet/care/return/${userId}/${pet.id}`,
                label: "Voltar",
                style: ButtonStyle.Secondary,
                disabled: !!!page
            }),
        )
    ]

    if (page) {
        if (page === "feed") {
            components.push(
                createSeparator(),
                new StringSelectMenuBuilder({
                    customId: `pet/care/feed/${userId}/${pet.id}`,
                    options: petsFood[pet.pet.animal].map(f => ({
                        label: f.name,
                        value: f.name,
                    }))
                })
            )
        }
    }
    
    const container = createContainer(settings.colors.fuchsia, ...components);

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}