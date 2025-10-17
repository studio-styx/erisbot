import { CachedPetBattle } from "#functions";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function battleMenu<R>(battle: CachedPetBattle): R {
    // Inicializa os botões
    const buttons: ButtonBuilder[] = [];

    // Se for a vez do pet 1, carregar os botões com os elementos dele
    if (battle.turn === "PET1") {
        battle.pet1.powers.forEach(power => {
            buttons.push(
                new ButtonBuilder({
                    customId: `battle/${battle.id}/${power.id}/${battle.user1Id}`,
                    label: power.name, 
                    style: ButtonStyle.Primary,
                })
            )
        });
    } else { // se não, cria do outro
        battle.pet2.powers.forEach(power => {
            buttons.push(
                new ButtonBuilder({
                    customId: `battle/${battle.id}/${power.id}/${battle.user2Id}`,
                    label: power.name, 
                    style: ButtonStyle.Primary,
                })
            )
        });
    }

    // cria as linhas cortadas em 5 botões cada
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < buttons.length; i += 5) {
        rows.push(createRow(buttons.slice(i, i + 5)));
    }
    
    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            `## Batalha de pets entre ${battle.pet1.name} e ${battle.pet2.name}`,
        ),
        createSeparator(),
        brBuilder(
            `### Status de: ${battle.pet1.name}`,
            `> **Vida**: ${battle.pet1.life}/100`,
            `> **Mana**: ${battle.pet1.mana}/100`,
            battle.effects.filter(effect => effect.effected === "PET1" || (effect.type === "BUFF" && effect.stats.effectAll || effect.type === "DEBUFF" && effect.stats.effectAll)).length > 0 ? brBuilder(
                `> **Efeitos**:`,
                ...battle.effects.map(effect => 
                    `> - ${effect.type} - ${effect.type === "DAMAGE" 
                    ? `**Dano**: ${effect.stats.damage}` : effect.type === "HEAL" 
                    ? `**Cura**: ${effect.stats.heal}` : effect.type === "BUFF" 
                    ? `**Buff**: ${effect.stats.elementBuffed}` : effect.type === "DEBUFF" 
                    ? `**Debuff**: ${effect.stats.elementDebuffed}` : ""}`
                )
            ) : null
        ),
        brBuilder(
            `### Status de: ${battle.pet2.name}`,
            `> **Vida**: ${battle.pet2.life}/100`,
            `> **Mana**: ${battle.pet2.mana}/100`,
            battle.effects.filter(effect => effect.effected === "PET2" || (effect.type === "BUFF" && effect.stats.effectAll || effect.type === "DEBUFF" && effect.stats.effectAll)).length > 0 ? brBuilder(
                `> **Efeitos**:`,
                ...battle.effects.map(effect => 
                    `> - ${effect.type} - ${effect.type === "DAMAGE" 
                    ? `**Dano**: ${effect.stats.damage}` : effect.type === "HEAL" 
                    ? `**Cura**: ${effect.stats.heal}` : effect.type === "BUFF" 
                    ? `**Buff**: ${effect.stats.elementBuffed}` : effect.type === "DEBUFF" 
                    ? `**Debuff**: ${effect.stats.elementDebuffed}` : ""}`
                )
            ) : null
        ),
        createSeparator(),
        ...rows
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}