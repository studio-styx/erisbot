import { getValidUserPet, icon, petAnimalFormatted, petRarityFormatted, res, resv2 } from "#functions";
import { brBuilder, createSeparator } from "@magicyan/discord";
import { ChatInputCommandInteraction, time } from "discord.js";

export async function petInfoCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { user, options } = interaction;
    const petId = Number(options.getString("pet", true));

    await interaction.deferReply();

    const pet = await getValidUserPet(petId, user.id, {
        include: {
            genetics: {
                include: {
                    gene: true
                }
            },
            skills: { include: { skill: true } },
            personality: { include: { trait: true } },
            pet: true,
            parent1: {
                include: {
                    pet: true
                }
            },
            parent2: {
                include: {
                    pet: true
                }
            },
            childsAsParent1: {
                include: {
                    pet: true
                }
            },
            childsAsParent2: {
                include: {
                    pet: true
                }
            },
        }
    });

    if (!pet) {
        interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar esse pet!`));
        return;
    }

    const childs = [...pet.childsAsParent1, ...pet.childsAsParent2];

    interaction.editReply(resv2.fuchsia(
        `## Informações do Pet`,
        createSeparator(),
        brBuilder(
            `**Nome: \`${pet.name}\`**`,
            `**Animal: \`${petAnimalFormatted[pet.pet.animal]}\`**`,
            `**Raridade: \`${petRarityFormatted[pet.pet.rarity]}\`**`,
            `**Espécie: \`${pet.pet.specie}\`**`,
            `**Gênero: \`${pet.gender === "MALE" ? "Macho" : "Fêmea"}\`**`,
            `**Fome:** ${pet.hungry}/100`,
            `**Vida:** ${pet.life}/100`,
            `**Felicidade:** ${pet.happiness}/100`,
            `**Energia:** ${pet.energy}/100`,
            `**Personalidades**: ${pet.personality.map(p => `**\`${p.trait.name}\`**`).join(", ")}`,
            `**Humor: \`${pet.humor}\`**`,
            `**Habilidades:** ${pet.skills.length > 0 ? pet.skills.map(skill => `**\`${skill.skill.name}\`** - Nível **${skill.level}**`).join(", ") : "Nenhuma"}`,
            `**Genética:** ${pet.genetics.length > 0
                ? pet.genetics.map(g => {
                    const gene = g.gene;
                    const origem = g.inheritedFromParent1 && g.inheritedFromParent2
                        ? "Ambos"
                        : g.inheritedFromParent1
                        ? "Pai"
                        : g.inheritedFromParent2
                            ? "Mãe"
                            : "Espécie";
                    const dom = gene.geneType === "DOMINANT" ? "`Dominante`" : gene.geneType === "CODOMINANT" ? "`Codominante`" : "`Recessivo`";
                    return `**\`${gene.trait}\`** (${gene.colorPart}) [${dom}, herdado de **${origem}**]`;
                }).join("\n")
                : "Nenhuma informação genética"
            }`,
            `**Pais:** ${pet.parent1 || pet.parent2
                ? [
                    pet.parent1 ? `**\`${pet.parent1.name}\`**` : "Desconhecido",
                    pet.parent2 ? `**\`${pet.parent2.name}\`**` : "Desconhecido"
                ].join(" x ")
                : "Nenhum (geração inicial)"}`,
            `**Filhos:** ${childs.length > 0
                ? childs.map(f => `**\`${f.name}\`**`).join(", ")
                : "Nenhum"
            }`,
            pet.gender === "FEMALE" ? `**Está grávida?**: ${pet.isPregnant === true ? `Sim, termina ${time(pet.pregnantEndAt!, "R")}` : "Não"}` : null
        )
    ))
    return;
}