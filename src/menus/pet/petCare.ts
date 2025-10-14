import { petPlays, petsFood } from "#functions";
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
            `**Energia:** ${pet.energy}/100`,
            `**Humor:** ${pet.humor}`,
            `**Gênero:** ${pet.gender === "MALE" ? "Macho" : "Fêmea"}`,
            `**Personalidade:** ${pet.personality.map(p => p.trait.name).join(", ")}`
        ),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `pet/care/feed/button/${userId}/${pet.id}`,
                label: "Alimentar",
                style: ButtonStyle.Success,
                disabled: !!page || pet.hungry === 100,
            }),
            new ButtonBuilder({
                customId: `pet/care/play/button/${userId}/${pet.id}`,
                label: "Brincar",
                style: ButtonStyle.Success,
                disabled: !!page
                    || pet.happiness >= 100
                    || pet.energy < 1
                    || ["happy", "veryHappy", "playful"].includes(pet.humor),

            }),
            new ButtonBuilder({
                customId: `pet/care/sleep/button/${userId}/${pet.id}`,
                label: "Dormir",
                style: ButtonStyle.Success,
                disabled: !!page || pet.energy === 100,
            }),
            new ButtonBuilder({
                customId: `pet/care/train/button/${userId}/${pet.id}`,
                label: "Treinar",
                style: ButtonStyle.Success,
                disabled: !!page || pet.energy <= 20 || pet.happiness <= 20 || pet.hungry <= 20,
            }),
            new ButtonBuilder({
                customId: `pet/care/return/button/${userId}/${pet.id}`,
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
                    customId: `pet/care/feed/select/${userId}/${pet.id}`,
                    placeholder: "Escolha a comida",
                    options: petsFood[pet.pet.animal].map(f => ({
                        label: f.name,
                        value: f.id,
                        description: `Preço: ${f.price} stx, recupera: ${f.points} de fome`
                    }))
                })
            )
        } else {
            components.push(
                createSeparator(),
                new StringSelectMenuBuilder({
                    customId: `pet/care/play/select/${userId}/${pet.id}`,
                    placeholder: "Escolha uma brincadeira",
                    options: petPlays[pet.pet.animal].map(p => ({
                        label: p.name,
                        value: p.id,
                        description: `Diversão: ${p.fun}, energia: ${p.energy}`
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